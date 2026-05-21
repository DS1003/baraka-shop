import type { NextAuthConfig } from "next-auth";

export const authConfig = {
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
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.username = token.username;
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
