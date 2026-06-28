import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

// Extend the config with real Prisma-backed authorize
const fullConfig = {
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱 / 登录码", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        const identifier = (credentials.email as string)?.trim();
        const password = credentials.password as string;

        if (!identifier) return null;

        // Try to find user by email (parent) or loginCode (child)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { loginCode: identifier.toUpperCase() },
            ],
          },
          include: { family: true },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          familyId: user.familyId,
        };
      },
    }),
  ],
};

export const { handlers, signIn, signOut, auth } = NextAuth(fullConfig);
