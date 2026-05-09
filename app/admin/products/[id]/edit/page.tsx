import ProductForm from '../../_components/ProductForm';
import { getProductByIdAction } from '@/lib/actions/product-actions';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Modifier un Produit | Admin',
};

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const product = await getProductByIdAction(params.id);

    if (!product) {
        redirect('/admin/products');
    }

    return (
        <div className="space-y-8">
            <div className="space-y-1.5">
                <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                    Modifier le <span className="text-orange-600">Produit.</span>
                </h1>
                <p className="text-[15px] text-slate-500 font-medium">
                    Mettez à jour les informations et les variantes du produit.
                </p>
            </div>
            <ProductForm editingProduct={product} />
        </div>
    );
}
