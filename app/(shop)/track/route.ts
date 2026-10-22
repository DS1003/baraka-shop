import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId') || searchParams.get('ref') || searchParams.get('orderRef') || '';

    if (!orderId) {
        return redirect('/boutique');
    }

    const cleanParam = encodeURIComponent(orderId.trim());

    // Vérifier si l'utilisateur a une session active
    const session = await auth();

    if (session?.user?.id) {
        // Utilisateur connecté : redirection directe vers son compte sur la commande exacte
        return redirect(`/account?tab=orders&orderId=${cleanParam}`);
    }

    // Utilisateur invité ou non connecté : redirection vers le suivi public sans forcer de mot de passe
    return redirect(`/order-success?orderId=${cleanParam}`);
}
