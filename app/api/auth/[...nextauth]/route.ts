import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";

const providers = [];

// Dynamically register GithubProvider if credentials are set
// Works with both GitHub Apps (expiring tokens) and classic OAuth Apps
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // Request repo scope for fetching user repositories
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    })
  );
}

// Dynamically register GoogleProvider if credentials are set
if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  );
}

// Always register credentials fallback provider
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email)
        });

        if (user && user.password && verifyPassword(credentials.password, user.password)) {
          return {
            id: user.id,
            name: user.name || "Workspace User",
            email: user.email,
            image: user.image
          };
        }
      } catch (err) {
        console.error("Auth database query error:", err);
      }

      return null;
    }
  })
);

/**
 * Refreshes a GitHub App user access token using the refresh token.
 * GitHub Apps issue expiring tokens (~8h) with refresh tokens (~6 months).
 * Returns the updated token fields, or marks the token with an error.
 */
async function refreshGitHubToken(token: any) {
  console.log("[NextAuth] Access token expired, attempting refresh...");

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok || refreshed.error) {
      console.error("[NextAuth] Token refresh failed:", refreshed);
      // Mark token with error so the session/frontend can force re-login
      return {
        ...token,
        error: "RefreshTokenError" as const,
      };
    }

    console.log("[NextAuth] Token refreshed successfully");
    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      accessTokenExpires: refreshed.expires_in
        ? Date.now() + refreshed.expires_in * 1000
        : Date.now() + 8 * 60 * 60 * 1000,
      error: undefined, // Clear any previous error
    };
  } catch (error) {
    console.error("[NextAuth] Token refresh network error:", error);
    return {
      ...token,
      error: "RefreshTokenError" as const,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email || (account?.provider === 'github' ? `${user.id}@github.placeholder.nebula.dev` : undefined);
      if (email) {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
          });
          if (!existingUser) {
            await db.insert(users).values({
              id: user.id || `u-${Math.random().toString(36).substring(2, 9)}`,
              name: user.name || "Nebula User",
              email: email,
              image: user.image || null,
              password: null
            });
          }
        } catch (err) {
          console.error("Error storing OAuth user in DB:", err);
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      const email = token.email || `${(token.userId as string) || (user?.id as string) || 'unknown'}@github.placeholder.nebula.dev`;
      try {
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, email)
        });
        
        if (!dbUser) {
          console.log(`[NextAuth] User ${email} not found in DB. Recreating user record...`);
          const newId = (token.userId as string) || (user?.id as string) || `u-${Math.random().toString(36).substring(2, 10)}`;
          const inserted = await db.insert(users).values({
            id: newId,
            name: (token.name as string) || "Nebula User",
            email: email,
            image: (token.picture as string) || null,
            password: null
          }).returning().then(rows => rows[0]);
          dbUser = inserted;
        }
        
        token.userId = dbUser.id;
        token.email = email;
      } catch (err) {
        console.error("JWT user fetch/recreate error:", err);
      }

      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // GitHub Apps return expires_at (seconds since epoch)
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 8 * 60 * 60 * 1000, // fallback: 8 hours
          error: undefined,
        };
      }

      // No refresh token available — classic OAuth App or credentials login
      // These tokens don't expire, so return as-is
      if (!token.refreshToken) {
        return token;
      }

      // Token hasn't expired yet — return as-is
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      // Token expired — attempt refresh via GitHub
      return await refreshGitHubToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error;
        (session.user as any).id = token.userId;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
