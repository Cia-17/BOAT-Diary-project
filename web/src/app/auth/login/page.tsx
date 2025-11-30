"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { QuoteCard } from "@/components/quote/quote-card";
import { fetchRandomQuote, type Quote } from "@/lib/quotes";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/security/owasp-rate-limiting-protection";
import { recordFailedAttempt, recordSuccessfulLogin, isAccountLocked, getRemainingAttempts } from "@/lib/security/owasp-account-lockout-protection";
import { logLoginAttempt, logRateLimitExceeded, logAccountLocked } from "@/lib/security/owasp-security-event-logger";
import { initializeCsrfProtection, getCsrfToken, validateCsrfToken } from "@/lib/security/owasp-csrf-token-protection";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  useEffect(() => {
    const loadQuote = async () => {
      setIsLoadingQuote(true);
      try {
        const randomQuote = await fetchRandomQuote();
        setQuote(randomQuote);
      } catch (error) {
        console.error("Failed to load quote:", error);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    loadQuote();
    
    // Initialize CSRF protection
    const token = initializeCsrfProtection();
    setCsrfToken(token);
  }, []);
  
  // Check account lockout status when email changes
  useEffect(() => {
    if (email) {
      const lockoutStatus = isAccountLocked(email);
      if (lockoutStatus.locked && lockoutStatus.remainingTime) {
        const minutesRemaining = Math.ceil((lockoutStatus.remainingTime || 0) / 60000);
        alert(`Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`);
      }
      setRemainingAttempts(getRemainingAttempts(email));
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // OWASP A04: CSRF Protection
    const storedToken = getCsrfToken();
    if (!csrfToken || !validateCsrfToken(csrfToken, storedToken || "")) {
      alert("Security validation failed. Please refresh the page and try again.");
      return;
    }
    
    // OWASP A07: Check account lockout
    const lockoutStatus = isAccountLocked(email);
    if (lockoutStatus.locked) {
      const minutesRemaining = lockoutStatus.remainingTime 
        ? Math.ceil(lockoutStatus.remainingTime / 60000) 
        : 15;
      alert(`Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`);
      return;
    }
    
    // OWASP A04: Rate Limiting
    const rateLimitKey = `login:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.AUTH);
    if (!rateLimit.allowed) {
      const minutesRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      alert(`Too many login attempts. Please try again in ${minutesRemaining} minute(s).`);
      logRateLimitExceeded(email, 'login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      console.log("Attempting to sign in user:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // OWASP A07: Record failed attempt and check lockout
        const lockoutResult = recordFailedAttempt(email);
        logLoginAttempt(email, false);
        
        if (lockoutResult.locked) {
          logAccountLocked(email);
          const minutesRemaining = lockoutResult.lockedUntil 
            ? Math.ceil((lockoutResult.lockedUntil - Date.now()) / 60000)
            : 15;
          alert(`Login failed. Account locked due to too many failed attempts. Please try again in ${minutesRemaining} minute(s).`);
        } else {
          const remaining = getRemainingAttempts(email);
          if (remaining <= 2) {
            alert(`Login failed: ${error.message}\n\nWarning: ${remaining} attempt(s) remaining before account lockout.`);
          } else {
            alert(`Login failed: ${error.message}`);
          }
        }
        
        setRemainingAttempts(getRemainingAttempts(email));
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log("User signed in successfully:", data.user.id);
        
        // OWASP A07: Record successful login (reset lockout)
        recordSuccessfulLogin(email);
        logLoginAttempt(email, true);
        
        router.push("/dashboard");
      } else {
        throw new Error("No user data returned from sign in");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more specific error messages
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.";
      }
      
      alert(`Login failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    router.push("/");
  };

  return (
    <MainLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Quote Display */}
          {isLoadingQuote ? (
            <Card className="bg-gradient-to-r from-[#FFF7D1] to-[#FFE7EF] border-0">
              <CardContent className="pt-6">
                <p className="text-base font-medium text-gray-800 italic text-center">
                  Loading quote...
                </p>
              </CardContent>
            </Card>
          ) : quote ? (
            <div className="text-center">
              <QuoteCard text={quote.text} author={quote.author} />
            </div>
          ) : null}

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="csrf_token" value={csrfToken} />
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <p className="text-sm text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-black font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGuestMode}
                >
                  Continue as Guest
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

