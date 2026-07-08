import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import type { UserRole } from "@/lib/auth/rbac";

declare module "next-auth" {
  interface User {
    role: UserRole;
    firstName: string;
    lastName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        let user;
        try {
          const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);
          user = result[0];
        } catch (error: unknown) {
          console.error("[auth] Database connection error:", error);
          const errName = error instanceof Error ? (error as { cause?: { name?: string } }).cause?.name || error.name : "";
          if (errName === "NeonDbError" || String(error).includes("fetch failed") || String(error).includes("ETIMEDOUT")) {
            throw new Error("Database connection failed. Please try again in a moment.");
          }
          throw new Error("An unexpected error occurred. Please try again.");
        }

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.status === "suspended") {
          throw new Error(
            "Your account has been suspended. Please contact support."
          );
        }

        if (user.status === "inactive") {
          throw new Error(
            "Your account is inactive. Please contact support."
          );
        }

        const isValidPassword = await verifyPassword(
          password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Update last login (non-critical, don't fail login if this errors)
        try {
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));
        } catch (error) {
          console.error("[auth] Failed to update last login:", error);
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.firstName !== undefined) token.firstName = session.user.firstName;
        if (session.user.lastName !== undefined) token.lastName = session.user.lastName;
        if (session.user.email !== undefined) token.email = session.user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes
      const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );
      const isApiRoute = pathname.startsWith("/api");

      if (isPublicRoute || isApiRoute) {
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirects to signIn page
      }

      // Role-based route protection
      const role = auth?.user?.role;

      if (pathname.startsWith("/admin")) {
        return role === "super_admin" || role === "admin";
      }

      if (pathname.startsWith("/student")) {
        return role === "student";
      }

      if (pathname.startsWith("/exam")) {
        return role === "student";
      }

      return true;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
