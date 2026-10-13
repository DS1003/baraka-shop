import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
    // Rate limit par IP (5 inscriptions max par 15 minutes)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const limiter = await rateLimit(`reg:${ip}`, 5, 900);

    if (!limiter.success) {
        return NextResponse.json(
            { message: `Trop de tentatives. Réessayez dans ${Math.ceil(limiter.reset / 60)} minutes.` },
            { status: 429 }
        );
    }

    try {
        const body = await req.json();
        const { username, email, password, phone } = body || {};

        if (!email || !password || !username) {
            return NextResponse.json(
                { message: "Veuillez renseigner tous les champs obligatoires (nom d'utilisateur, email, mot de passe)." },
                { status: 400 }
            );
        }

        const trimmedUsername = String(username).trim();
        const normalizedEmail = String(email).trim().toLowerCase();
        const cleanPassword = String(password);
        const trimmedPhone = phone ? String(phone).trim() : null;

        if (trimmedUsername.length < 2 || trimmedUsername.length > 50) {
            return NextResponse.json(
                { message: "Le nom d'utilisateur doit contenir entre 2 et 50 caractères." },
                { status: 400 }
            );
        }

        if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 100) {
            return NextResponse.json(
                { message: "L'adresse email n'est pas valide." },
                { status: 400 }
            );
        }

        if (cleanPassword.length < 8) {
            return NextResponse.json(
                { message: "Le mot de passe doit comporter au moins 8 caractères." },
                { status: 400 }
            );
        }

        if (cleanPassword.length > 128) {
            return NextResponse.json(
                { message: "Le mot de passe est trop long (maximum 128 caractères)." },
                { status: 400 }
            );
        }

        if (trimmedPhone && (trimmedPhone.length < 6 || trimmedPhone.length > 25)) {
            return NextResponse.json(
                { message: "Le numéro de téléphone n'est pas valide." },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { username: trimmedUsername },
                    ...(trimmedPhone ? [{ phone: trimmedPhone }] : [])
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Cet utilisateur existe déjà (email, nom d'utilisateur ou téléphone)." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        const user = await prisma.user.create({
            data: {
                username: trimmedUsername,
                email: normalizedEmail,
                password: hashedPassword,
                phone: trimmedPhone,
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
