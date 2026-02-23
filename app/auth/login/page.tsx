"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Starting login...");
      const user = await login(email, password);
      console.log("Login function completed, user:", user);

      // Show success toast
      toast({
        title: "Success",
        description: "Logged in successfully. Redirecting...",
      });

      // Determine redirect path based on role
      const targetPath =
        user.role === "HR" || user.role === "ADMIN" ? "/hr" : "/candidate";

      console.log("Navigating to:", targetPath);

      // Use setTimeout to ensure toast renders before navigation
      setTimeout(() => {
        console.log("Executing navigation to:", targetPath);
        window.location.href = targetPath;
      }, 100);
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex justify-center">
            <img src="/blue.png" alt="Qmindai" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
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
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className="w-full sm:w-auto sm:min-w-[200px] text-white font-medium py-2.5 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0b66c3, #3f89d2)",
                }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link
              href="/auth/register"
              className="font-semibold hover:underline"
              style={{ color: "#0b66c3" }}
            >
              Sign up
            </Link>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
