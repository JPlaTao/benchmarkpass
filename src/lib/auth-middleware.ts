// Lightweight auth for middleware (no Prisma dependency)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Minimal auth config for middleware use only (JWT decode)
export const { auth: middlewareAuth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      authorize: () => null, // Not used in middleware
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});
