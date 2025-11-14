import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAccessToken, signRefreshToken } from "@/lib/auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: "Google auth is not configured" }, { status: 500 });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Google account is missing an email" }, { status: 400 });
    }

    const email = payload.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(2);
      const passwordHash = await hashPassword(randomPassword);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: payload.name ?? email,
        },
      });
    }

    const jwtPayload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.error("Google auth error", e);
    return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 });
  }
}


