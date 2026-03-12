"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const otpId = searchParams.get("otpId");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId || !otpId) {
      router.push("/login");
    }
  }, [userId, otpId, router]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn("otp-verify", {
        userId,
        otpId,
        otp: otpString,
        redirect: false,
      });

      if (result?.error) {
        const err = result.error;
        if (err.includes("MAX_ATTEMPTS_EXCEEDED")) {
          setLocked(true);
          return;
        }
        if (err.includes("INVALID_OTP")) {
          const remaining = err.split(":")[1];
          setError(`Invalid OTP. ${remaining} attempt(s) remaining.`);
        } else {
          setError("Authentication failed. Please try again.");
        }
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      router.push("/chat");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (locked) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black uppercase mb-4">Account Locked</h2>
          <p className="font-bold mb-6">
            Too many failed attempts. Your account has been temporarily locked for 30 minutes.
          </p>
          <Button onClick={() => router.push("/login")} variant="secondary">
            Back to Login
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-black uppercase mb-2 pb-4 border-b-4 border-black">
        Verify OTP
      </h2>
      <p className="text-sm font-bold mb-6 mt-4">
        Enter the 6-digit code sent to your email. You have{" "}
        <span className="font-black px-2 py-1 bg-red text-white border-2 border-black">3 attempts</span>.
      </p>

      {error && (
        <div className="p-3 mb-4 font-black text-sm border-4 border-black bg-red text-white">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-black border-4 border-black bg-white"
              style={{ boxShadow: "4px 4px 0px #000" }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>

      <button
        onClick={() => router.push("/login")}
        className="w-full mt-4 text-center font-black text-sm hover:bg-yellow px-3 py-2 border-2 border-black uppercase transition-colors"
      >
        ← Back to Login
      </button>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <Card>
        <div className="text-center py-8">
          <p className="font-bold">Loading...</p>
        </div>
      </Card>
    }>
      <OtpForm />
    </Suspense>
  );
}
