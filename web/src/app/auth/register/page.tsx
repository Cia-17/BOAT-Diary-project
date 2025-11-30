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
import { validatePassword, getPasswordStrengthLabel } from "@/lib/security/owasp-password-strength-validator";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/security/owasp-rate-limiting-protection";
import { logRegistrationAttempt } from "@/lib/security/owasp-security-event-logger";
import { initializeCsrfProtection, getCsrfToken, validateCsrfToken } from "@/lib/security/owasp-csrf-token-protection";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [csrfToken, setCsrfToken] = useState<string>("");

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
  
  // Validate password as user types
  useEffect(() => {
    if (password.length > 0) {
      const validation = validatePassword(password);
      setPasswordStrength(validation.strength);
      setPasswordFeedback(validation.message);
    } else {
      setPasswordStrength(0);
      setPasswordFeedback("");
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // OWASP A04: CSRF Protection
    const storedToken = getCsrfToken();
    if (!csrfToken || !validateCsrfToken(csrfToken, storedToken || "")) {
      alert("Security validation failed. Please refresh the page and try again.");
      return;
    }
    
    // OWASP A04: Rate Limiting
    const rateLimitKey = `register:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.REGISTRATION);
    if (!rateLimit.allowed) {
      const minutesRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      alert(`Too many registration attempts. Please try again in ${minutesRemaining} minute(s).`);
      logRegistrationAttempt(email, false);
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    // OWASP A07: Strong Password Validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      alert(passwordValidation.message);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      console.log("Attempting to sign up user:", { email, hasName: !!name });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        alert(`Registration failed: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log("User created successfully:", data.user.id);
        logRegistrationAttempt(email, true);
        alert("Account created successfully! Please check your email to verify your account.");
        router.push("/auth/login");
      } else {
        throw new Error("No user data returned from sign up");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      logRegistrationAttempt(email, false);
      
      // Provide more specific error messages
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.";
      }
      
      alert(`Registration failed: ${errorMessage}`);
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

          {/* Register Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="csrf_token" value={csrfToken} />
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
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
                    minLength={12}
                  />
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Password Strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 2 ? 'text-red-600' :
                          passwordStrength <= 3 ? 'text-orange-600' :
                          passwordStrength <= 4 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {getPasswordStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            passwordStrength <= 2 ? 'bg-red-600' :
                            passwordStrength <= 3 ? 'bg-orange-600' :
                            passwordStrength <= 4 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${(passwordStrength / 6) * 100}%` }}
                        />
                      </div>
                      {passwordFeedback && (
                        <p className="text-xs text-red-600 mt-1">{passwordFeedback}</p>
                      )}
                    </div>
                  )}
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
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
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
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <p className="text-sm text-center text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-black font-medium hover:underline">
                    Sign in
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

