import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Init Cloudinary Config
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Get correct real world timestamp to override local clock skew
        let timestamp = Math.floor(Date.now() / 1000);
        try {
            const timeCheck = await fetch('https://www.google.com', { method: 'HEAD' });
            const dateHeader = timeCheck.headers.get('date');
            if (dateHeader) {
                timestamp = Math.floor(new Date(dateHeader).getTime() / 1000);
            }
        } catch (err) {
            console.error('Error syncing real-world time for Cloudinary:', err);
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'Aucun fichier envoyé.' },
                { status: 400 }
            );
        }

        const validFiles = files.filter(file => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
            return allowedTypes.includes(file.type) && file.size <= 20 * 1024 * 1024;
        });

        if (validFiles.length === 0) {
            return NextResponse.json(
                { error: 'Aucun fichier valide. Formats acceptés : JPG, PNG, WebP, GIF, AVIF. Max 20MB.' },
                { status: 400 }
            );
        }

        // Upload parallèle vers Cloudinary (préserve l'ordre initial des fichiers)
        const uploadPromises = validFiles.map(async (file) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            return new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    folder: 'products_baraka',
                    resource_type: 'auto',
                    timestamp: timestamp
                }, (error, result) => {
                    if (error) reject(error);
                    else if (result?.secure_url) resolve(result.secure_url);
                    else reject(new Error('Cloudinary upload missing secure_url'));
                }).end(buffer);
            });
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        return NextResponse.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload.' },
            { status: 500 }
        );
    }
}
