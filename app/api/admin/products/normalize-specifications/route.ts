import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeProductSpecsStream } from "@/lib/ai-service";

export const dynamic = 'force-dynamic';

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

        const responseStream = await normalizeProductSpecsStream(rawText);

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(chunk.text));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error("API normalize-specifications error:", error);
        return NextResponse.json({ success: false, message: error.message || "Erreur serveur" }, { status: 500 });
    }
}
