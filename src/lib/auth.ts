import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
    Credentials({
      id: "otp-verify",
      name: "OTP Verify",
      credentials: {
        userId: { type: "text" },
        otpId: { type: "text" },
        otp: { type: "text" },
      },
      async authorize(credentials) {
        const userId = credentials?.userId as string;
        const otpId = credentials?.otpId as string;
        const otp = credentials?.otp as string;
        if (!userId || !otpId || !otp) return null;

        const otpRecord = await prisma.otpAttempt.findUnique({
          where: { id: otpId },
          include: { user: true },
        });

        if (!otpRecord || otpRecord.userId !== userId) return null;
        if (otpRecord.verified) return null;
        if (otpRecord.expiresAt < new Date()) return null;

        if (otpRecord.attempts >= 3) {
          // Lock account - no new sessions
          await prisma.user.update({
            where: { id: userId },
            data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) }, // 30 min lock
          });
          throw new Error("MAX_ATTEMPTS_EXCEEDED");
        }

        if (otpRecord.otp !== otp) {
          await prisma.otpAttempt.update({
            where: { id: otpId },
            data: { attempts: otpRecord.attempts + 1 },
          });

          const remaining = 2 - otpRecord.attempts;
          if (remaining <= 0) {
            await prisma.user.update({
              where: { id: userId },
              data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) },
            });
            throw new Error("MAX_ATTEMPTS_EXCEEDED");
          }
          throw new Error(`INVALID_OTP:${remaining}`);
        }

        // OTP is valid
        await prisma.otpAttempt.update({
          where: { id: otpId },
          data: { verified: true },
        });

        return {
          id: otpRecord.user.id,
          name: otpRecord.user.name,
          email: otpRecord.user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
