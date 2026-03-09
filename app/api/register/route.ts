import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
    // Rate limit par IP (5 inscriptions max par 15 minutes)
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = await rateLimit(`reg:${ip}`, 5, 900);

    if (!limiter.success) {
        return NextResponse.json(
            { message: `Trop de tentatives. Réessayez dans ${Math.ceil(limiter.reset / 60)} minutes.` },
            { status: 429 }
        );
    }

    try {
        const { username, email, password, phone } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json(
                { message: "Champs manquants" },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                    { phone: phone || undefined }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Cet utilisateur existe déjà (email, username ou téléphone)" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                phone: phone || null,
                role: "USER"
            }
        });

        return NextResponse.json(
            { message: "Utilisateur créé avec succès", userId: user.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Une erreur est survenue lors de l'inscription" },
            { status: 500 }
        );
    }
}
