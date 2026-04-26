import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'Aucun fichier envoyé.' },
                { status: 400 }
            );
        }

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        await mkdir(uploadDir, { recursive: true });

        const uploadedUrls: string[] = [];

        for (const file of files) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
            if (!allowedTypes.includes(file.type)) {
                continue; // Skip invalid files silently
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                continue;
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const ext = path.extname(file.name) || '.jpg';
            const uniqueName = `${randomUUID()}${ext}`;
            const filePath = path.join(uploadDir, uniqueName);

            await writeFile(filePath, buffer);

            // Return the public URL
            uploadedUrls.push(`/uploads/products/${uniqueName}`);
        }

        if (uploadedUrls.length === 0) {
            return NextResponse.json(
                { error: 'Aucun fichier valide. Formats acceptés : JPG, PNG, WebP, GIF. Max 5MB.' },
                { status: 400 }
            );
        }

        return NextResponse.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload.' },
            { status: 500 }
        );
    }
}
