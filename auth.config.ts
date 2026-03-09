import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdminRoute = nextUrl.pathname.startsWith("/admin");
            const isLoginRoute = nextUrl.pathname === "/login";

            if (isAdminRoute) {
                if (isLoggedIn) {
                    // Check role if needed, but 'auth' here might not have role yet if it's too early
                    // Usually role is in the token/session
                    if (auth?.user?.role === "ADMIN") return true;
                    return Response.redirect(new URL("/", nextUrl));
                }
                return false; // Redirect to login
            }

            if (isLoginRoute && isLoggedIn) {
                const userRole = (auth?.user as any)?.role;
                const redirectUrl = userRole === "ADMIN" ? "/admin" : "/";
                return Response.redirect(new URL(redirectUrl, nextUrl));
            }

            return true;
        },
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
    providers: [], // Add providers with setup in auth.ts
} satisfies NextAuthConfig;
