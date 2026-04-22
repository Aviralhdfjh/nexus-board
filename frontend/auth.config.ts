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
      const isAuthPage = path.startsWith("/login") || path.startsWith("/register");
      const isLanding = path === "/" || path === "/landing";
      const isBoardArea = path.startsWith("/board") || path.startsWith("/boards");

      // Auth pages: if already logged in, send to boards; otherwise allow.
      if (isAuthPage) {
        return isLoggedIn ? Response.redirect(new URL("/boards", nextUrl)) : true;
      }

      // Landing page is always public.
      if (isLanding) {
        return true;
      }

      // Only board-related pages require authentication.
      if (isBoardArea) {
        return isLoggedIn || Response.redirect(new URL("/login", nextUrl));
      }

      // Any other route is public.
      return true;
    },
  },
  providers: [],
};
