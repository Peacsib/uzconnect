import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawInput = (body.email || "").trim();

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: "Please provide your email address or registration number." },
        { status: 400 }
      );
    }

    // 1. Extract potential registration number prefix (e.g. "R2421428" from "R2421428@uofzmail.co.zw")
    let regPrefix = "";
    if (rawInput.includes("@")) {
      regPrefix = rawInput.split("@")[0].toUpperCase();
    } else {
      regPrefix = rawInput.toUpperCase();
    }

    // 2. Query Prisma for user matching email or regNumber
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: rawInput.toLowerCase() },
          ...(regPrefix ? [{ regNumber: regPrefix }] : []),
          ...(regPrefix ? [{ email: `${regPrefix.toLowerCase()}@uofzmail.uz.ac.zw` }] : []),
          ...(regPrefix ? [{ email: `${regPrefix.toLowerCase()}@uofzmail.co.zw` }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No account found matching this email or registration number. Please check your credentials.",
        },
        { status: 404 }
      );
    }

    // 3. Generate secure token & 6-digit OTP code
    const token = crypto.randomBytes(32).toString("hex");
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Clean up any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Save token in database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        code: otpCode,
        expiresAt,
      },
    });

    // 4. Construct reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    // 5. Send email (via Nodemailer if configured, or simulated)
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      otpCode,
    });

    return NextResponse.json({
      success: true,
      email: user.email,
      name: user.name,
      code: otpCode, // Provided for instant seamless local verification
      token,
      message: `A 6-digit verification code has been generated for ${user.email}.`,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while processing your reset request." },
      { status: 500 }
    );
  }
}
