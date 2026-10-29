import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized: () => true,
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.username = user.username;
                // Protection stricte contre l'explosion du cookie JWT (RFC 6265, max cookie 4KB)
                if (user.image && typeof user.image === 'string' && !user.image.startsWith('data:') && user.image.length < 1000) {
                    token.picture = user.image;
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.username = token.username;
                if (token.picture) {
                    session.user.image = token.picture;
                }
            }
            return session;
        },
    },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: false, // Norme 2026 : protection stricte contre le détournement de compte
        }),
    ],
} satisfies NextAuthConfig;

