import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { NextResponse } from "next/server";
import axios from "axios";
import appConfig from "@/config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+email", // OPTIONAL: Add guilds "+guilds"
      async profile(profile) {
        const isAdmin = appConfig.admins.some(
          (admin) => admin.id === profile.id
        );
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
          isAdmin,
        };
      },
    }),
  ],

  pages: {
    error: "/auth/error",
  },

  callbacks: {
    authorized: async ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).accessToken = token.accessToken;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = account.providerAccountId;
        token.isAdmin = appConfig.admins.some(
          (admin) => admin.id === account.providerAccountId
        );
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      return true;
    },
  },
});
