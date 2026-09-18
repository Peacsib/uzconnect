import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, token, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!email && !token) {
      return NextResponse.json(
        { success: false, error: "Email or reset token is required." },
        { status: 400 }
      );
    }

    // 1. Find valid reset token in database
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        AND: [
          token ? { token } : { email: email.toLowerCase() },
          code ? { code: code.trim() } : {},
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 3. Update user password
    const user = await prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    });

    // 4. Delete used tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetRecord.email },
    });

    console.log(`[Password Reset] Password successfully updated for ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
