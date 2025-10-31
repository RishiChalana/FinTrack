import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function requireAuth(req: NextRequest) {
  const authz = req.headers.get("authorization");
  if (!authz || !authz.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authz.slice("Bearer ".length).trim();
  return verifyToken(token);
}


