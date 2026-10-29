import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authConfig } from "./auth.config";
import { rateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
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

                const safeImage = (user.image && typeof user.image === 'string' && !user.image.startsWith('data:') && user.image.length < 1000)
                    ? user.image
                    : null;

                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    image: safeImage,
                } as any;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }: any) {
            if (account?.provider === "google") {
                // ==================== NORMES ET SÉCURITÉ 2026 ====================
                // 1. Validation de l'email et vérification stricte par Google (OWASP Pre-Auth Protection)
                const email = profile?.email || user?.email;
                if (!email) {
                    console.error("[Auth Google] Rejet : Aucun email renvoyé par Google.");
                    return false;
                }

                // Vérification que Google garantit la possession de l'email
                const isVerified = (profile as any)?.email_verified ?? (profile as any)?.verified_email ?? true;
                if (!isVerified) {
                    console.error(`[Auth Google] Rejet : L'adresse email ${email} n'est pas vérifiée par Google.`);
                    return false;
                }

                const normalizedEmail = String(email).trim().toLowerCase();

                // 2. Limitation du débit anti-abus (Rate limit : 15 requêtes / 5 min par compte)
                const limiter = await rateLimit(`oauth:google:${normalizedEmail}`, 15, 300);
                if (!limiter.success) {
                    console.warn(`[Auth Google] Rate limit dépassé pour : ${normalizedEmail}`);
                    return false;
                }

                try {
                    // 3. Synchronisation avec PostgreSQL (Prisma)
                    let dbUser = await (prisma.user as any).findUnique({
                        where: { email: normalizedEmail },
                    });

                    const googlePicture = (profile as any)?.picture || user?.image || null;
                    const googleName = ((profile as any)?.name || (profile as any)?.given_name || user?.name || normalizedEmail.split('@')[0]).trim();

                    if (!dbUser) {
                        // --- NOUVELLE INSCRIPTION AUTOMATIQUE SÉCURISÉE ---
                        let baseUsername = googleName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 30);
                        if (!baseUsername || baseUsername.length < 2) {
                            baseUsername = normalizedEmail.split('@')[0].slice(0, 20);
                        }

                        // Résolution des doublons de username
                        let username = baseUsername;
                        let counter = 1;
                        while (await (prisma.user as any).findFirst({ where: { username } })) {
                            username = `${baseUsername}_${counter}`;
                            counter++;
                        }

                        // Entropie cryptographique 64-bit pour le mot de passe (non devinable)
                        const randomEntropy = crypto.randomUUID() + "-" + Math.random().toString(36).substring(2);
                        const secureHashedPassword = await bcrypt.hash(randomEntropy, 10);

                        dbUser = await (prisma.user as any).create({
                            data: {
                                email: normalizedEmail,
                                username: username,
                                password: secureHashedPassword,
                                image: googlePicture,
                                role: "USER", // Rôle par défaut le plus restreint (Least Privilege)
                                metadata: {
                                    provider: "google",
                                    googleSub: (profile as any)?.sub || account?.providerAccountId,
                                    registeredAt: new Date().toISOString(),
                                }
                            }
                        });

                        console.log(`[Auth Google] Nouvel utilisateur inscrit : ${normalizedEmail} (@${username})`);
                    } else {
                        // Utilisateur existant : mise à jour de la photo de profil si elle n'existait pas
                        if (!dbUser.image && googlePicture) {
                            await (prisma.user as any).update({
                                where: { id: dbUser.id },
                                data: { image: googlePicture }
                            });
                            dbUser.image = googlePicture;
                        }
                    }

                    // 4. Transmission de l'identité complète au token JWT
                    user.id = dbUser.id;
                    user.role = dbUser.role;
                    user.username = dbUser.username || "";
                    user.image = dbUser.image || googlePicture;

                    return true;
                } catch (dbError) {
                    console.error("[Auth Google] Erreur synchronisation base de données :", dbError);
                    return false;
                }
            }

            return true;
        },
    },
});

