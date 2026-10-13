import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

import { rateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                identifier: { label: "Email, username or phone", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const rawIdentifier = (credentials?.identifier || (credentials as any)?.email) as string | undefined;
                if (!rawIdentifier || !credentials?.password) return null;

                const identifier = String(rawIdentifier).trim();
                const lowerIdentifier = identifier.toLowerCase();

                // Protection contre le brute-force : max 10 tentatives par 5 minutes par compte
                const limiter = await rateLimit(`login:${lowerIdentifier}`, 10, 300);
                if (!limiter.success) {
                    console.warn(`[Auth] Rate limit exceeded for identifier: ${lowerIdentifier}`);
                    return null;
                }

                // Utilisation de findFirst avec recherche sur plusieurs champs
                const user = await (prisma.user as any).findFirst({
                    where: {
                        OR: [
                            { email: lowerIdentifier },
                            { email: identifier },
                            { username: identifier },
                            { phone: identifier }
                        ]
                    },
                });

                if (!user || !user.password) return null;

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                } as any;
            },
        }),
    ],
});
