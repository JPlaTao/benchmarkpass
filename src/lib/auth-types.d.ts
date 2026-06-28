import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: UserRole;
    familyId?: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: UserRole;
      familyId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: UserRole;
    familyId?: string | null;
  }
}
