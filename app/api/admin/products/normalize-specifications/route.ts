import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeProductSpecs } from "@/lib/ai-service";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { rawText } = body;

        if (!rawText) {
            return NextResponse.json({ success: false, message: "Texte brut manquant" }, { status: 400 });
        }

        const normalized = await normalizeProductSpecs(rawText);

        return NextResponse.json({ success: true, normalized });
    } catch (error: any) {
        console.error("API normalize-specifications error:", error);
        return NextResponse.json({ success: false, message: error.message || "Erreur serveur" }, { status: 500 });
    }
}
