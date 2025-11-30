"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Heart,
  BarChart3,
  Shield,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Mic,
  Video,
  ArrowRight,
  Check,
  Star,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-[#F4D35E]" />
              <span className="text-2xl font-bold text-gray-900">DiaryPro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF7D1] via-[#FFE7EF] to-[#B7E4C7] py-20 sm:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F4A261] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F4D35E] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-[#F4A261]" />
                <span className="text-sm font-medium text-gray-700">
                  Trusted by 10,000+ journalers
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Your Personal Journey,
                <br />
                <span className="text-[#F4A261]">Beautifully Documented</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-700 mb-8">
                Capture your daily experiences, track your moods, and reflect on
                your growth with DiaryPro—the modern journaling platform designed
                for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth/register">
                  <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800">
                    Start Journaling Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-2 font-medium">4.9/5</span>
                </div>
                <span>•</span>
                <span>No credit card required</span>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&q=80"
                  alt="Journaling"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F4D35E] rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mood Tracking</p>
                    <p className="text-sm text-gray-600">Visual insights</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#B7E4C7] rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Daily Entries</p>
                    <p className="text-sm text-gray-600">Never miss a day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FFF7D1]/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F4D35E]/10 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4 text-[#F4A261]" />
              <span className="text-sm font-medium text-gray-700">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Journal
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to make journaling effortless and meaningful
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#F4D35E] transition-all bg-white">
              <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&q=80"
                  alt="Mood Tracking"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F4D35E]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-[#F4A261]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mood Tracking
              </h3>
              <p className="text-gray-600">
                Track your emotional journey with visual mood indicators and
                insightful analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#F7C6CE] transition-all bg-white">
              <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                <Image
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&q=80"
                  alt="Rich Media"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F7C6CE]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-[#F4A261]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Rich Media Support
              </h3>
              <p className="text-gray-600">
                Add photos, audio recordings, and videos to bring your entries
                to life.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#B7E4C7] transition-all bg-white">
              <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                <Image
                  src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&q=80"
                  alt="Calendar View"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#B7E4C7]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#F4A261]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Calendar View
              </h3>
              <p className="text-gray-600">
                Visualize your journaling journey with an intuitive calendar
                interface.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#F4A261] transition-all bg-white">
              <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80"
                  alt="Analytics"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F4A261]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-[#F4A261]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Insights & Analytics
              </h3>
              <p className="text-gray-600">
                Discover patterns in your mood and journaling habits with
                beautiful charts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#FFF7D1] transition-all bg-white">
              <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                <Image
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&q=80"
                  alt="Security"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D1]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-[#F4A261]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Private & Secure
              </h3>
              <p className="text-gray-600">
                Your thoughts are yours alone. Bank-level encryption keeps your
                journal private.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#FFE7EF] transition-all bg-white">
              <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80"
                  alt="Inspiration"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFE7EF]/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-[#F4A261]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Daily Inspiration
              </h3>
              <p className="text-gray-600">
                Get motivated with daily inspirational quotes to spark your
                writing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start journaling in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#F4D35E] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your Account
              </h3>
              <p className="text-gray-600">
                Sign up in seconds with just your email. No credit card
                required.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#F7C6CE] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Writing
              </h3>
              <p className="text-gray-600">
                Express yourself freely. Add your mood, photos, and memories to
                each entry.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#B7E4C7] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Your Growth
              </h3>
              <p className="text-gray-600">
                Review your journey, discover patterns, and celebrate your
                progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#F4A261] to-[#F4D35E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500K+</div>
              <div className="text-white/90">Entries Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-white/90">User Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/90">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#B7E4C7]/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=800&fit=crop&q=80"
                  alt="Journaling Benefits"
                  width={600}
                  height={800}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#F4D35E] rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Growth Tracker</p>
                    <p className="text-sm text-gray-600">See your progress</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  "Journaling with DiaryPro has transformed how I reflect on my daily life."
                </p>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#B7E4C7]/10 px-4 py-2 rounded-full mb-6">
                <Heart className="h-4 w-4 text-[#F4A261]" />
                <span className="text-sm font-medium text-gray-700">Why Choose Us</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Why Journal with DiaryPro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#F4A261] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Improve Mental Wellbeing
                    </h3>
                    <p className="text-gray-600">
                      Regular journaling helps reduce stress and improve
                      emotional clarity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#F4A261] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Track Your Progress
                    </h3>
                    <p className="text-gray-600">
                      Visualize your emotional journey and see how far you've
                      come.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#F4A261] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Preserve Memories
                    </h3>
                    <p className="text-gray-600">
                      Capture life's moments with text, photos, audio, and video
                      in one place.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#F4A261] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Access Anywhere
                    </h3>
                    <p className="text-gray-600">
                      Your journal is always with you, on any device, anywhere
                      in the world.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Journalers Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "DiaryPro has become an essential part of my daily routine. The mood tracking feature helps me understand my emotional patterns better."
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
                  alt="Sarah"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-600">Writer</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The calendar view is amazing! I can see my entire journey at a glance. It's beautiful and functional."
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
                  alt="Michael"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">Michael Rodriguez</p>
                  <p className="text-sm text-gray-600">Designer</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Privacy was my main concern, but DiaryPro's security gives me peace of mind. My thoughts are truly private."
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80"
                  alt="Emma"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">Emma Thompson</p>
                  <p className="text-sm text-gray-600">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop&q=80"
            alt="CTA Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4A261]/90 to-[#F4D35E]/90"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of people who are already documenting their lives
            with DiaryPro
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/80 text-sm mt-4">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-[#F4D35E]" />
                <span className="text-xl font-bold text-white">DiaryPro</span>
              </div>
              <p className="text-sm">
                Your personal journaling companion for documenting life's
                beautiful moments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} DiaryPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

