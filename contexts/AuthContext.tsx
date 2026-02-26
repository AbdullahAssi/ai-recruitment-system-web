"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "HR" | "ADMIN";
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  /** Avatar stored at 256×256 px WebP, served from /uploads/avatars/{userId}.webp */
  avatarUrl?: string | null;
  candidate?: {
    id: string;
    experience?: number;
    location?: string;
    bio?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  hrProfile?: {
    id: string;
    companyId?: string;
    department?: string;
    position?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "CANDIDATE" | "HR";
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Important: include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: include cookies
      });

      if (!response.ok) {
        const error = await response.json();
        // If unverified, redirect to the verify-email page
        if (error.requiresVerification && error.email) {
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(error.email)}`;
        }
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful, user data:", data.user);

      // Update user state immediately
      setUser(data.user);

      // Return user data so the login page can handle navigation
      return data.user;
    } catch (error) {
      console.error("Login error in catch block:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      const result = await response.json();

      // Registration successful – redirect to email verification page
      if (result.requiresVerification) {
        const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(result.email)}`;
        window.location.replace(verifyUrl);
        return;
      }

      // Fallback: if somehow already verified, redirect based on role
      const targetPath =
        result.user?.role === "HR" || result.user?.role === "ADMIN"
          ? "/hr"
          : "/candidate";
      window.location.replace(targetPath);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
