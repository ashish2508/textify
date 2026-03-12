"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      const params = new URLSearchParams({
        userId: data.userId,
        otpId: data.otpId,
      });
      router.push(`/verify-otp?${params.toString()}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-black uppercase mb-6 border-b-3 border-border pb-3">
        Login
      </h2>

      {error && (
        <div className="bg-primary/10 neo-border p-3 mb-4 font-bold text-sm text-primary">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? "Sending OTP..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center font-medium">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-black underline decoration-3 underline-offset-4 hover:bg-accent px-1 transition-colors"
        >
          Register
        </Link>
      </p>
    </Card>
  );
}
