import type { NextAuthConfig } from "next-auth";

const secret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "nexus-board-dev-secret");

export const authConfig: NextAuthConfig = {
  secret,
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      if (path.startsWith("/login") || path.startsWith("/register"))
        return isLoggedIn && path.startsWith("/login") ? Response.redirect(new URL("/", nextUrl)) : true;
      return isLoggedIn || Response.redirect(new URL("/login", nextUrl));
    },
  },
  providers: [],
};
