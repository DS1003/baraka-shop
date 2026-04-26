import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
    try {
        // Init Cloudinary Config
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'Aucun fichier envoyé.' },
                { status: 400 }
            );
        }

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

            // Upload vers Cloudinary
            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    folder: 'products_baraka',
                    resource_type: 'auto'
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            }) as any;

            uploadedUrls.push(uploadResponse.secure_url);
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
