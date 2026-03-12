import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, otpId, otp } = await req.json();

    if (!userId || !otpId || !otp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.otpAttempt.findUnique({
      where: { id: otpId },
    });

    if (!otpRecord || otpRecord.userId !== userId) {
      return NextResponse.json(
        { error: "Invalid OTP session" },
        { status: 400 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please login again." },
        { status: 410 }
      );
    }

    if (otpRecord.verified) {
      return NextResponse.json(
        { error: "OTP already used" },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      await prisma.user.update({
        where: { id: userId },
        data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) },
      });
      return NextResponse.json(
        { error: "Maximum attempts exceeded. Account temporarily locked." },
        { status: 403 }
      );
    }

    if (otpRecord.otp !== otp) {
      const updated = await prisma.otpAttempt.update({
        where: { id: otpId },
        data: { attempts: otpRecord.attempts + 1 },
      });

      const remaining = 3 - updated.attempts;

      if (remaining <= 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) },
        });
        return NextResponse.json(
          { error: "Maximum attempts exceeded. Account temporarily locked." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Invalid OTP. ${remaining} attempt(s) remaining.` },
        { status: 401 }
      );
    }

    // OTP is valid
    await prisma.otpAttempt.update({
      where: { id: otpId },
      data: { verified: true },
    });

    return NextResponse.json({ message: "OTP verified", verified: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
