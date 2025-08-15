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
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | null;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // On initial sign-in, profile is available
      if (account && profile) {
        // Explicitly type the profile object for Discord
        const discordProfile = profile as {
          id: string;
          username: string;
          email: string;
          avatar: string | null;
        };

        token.id = discordProfile.id;
        token.name = discordProfile.username;
        token.email = discordProfile.email;
        token.picture = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
          : null;

        // Centralized admin check
        const isAdmin = appConfig.admins.some(
          (admin) => admin.id === discordProfile.id
        );
        token.isAdmin = isAdmin;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      return true;
    },
  },
});
