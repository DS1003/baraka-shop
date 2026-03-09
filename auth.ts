import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                identifier: { label: "Email, username or phone", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) return null;

                const identifier = credentials.identifier as string;

                // Utilisation de findFirst avec recherche sur plusieurs champs
                const user = await (prisma.user as any).findFirst({
                    where: {
                        OR: [
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
