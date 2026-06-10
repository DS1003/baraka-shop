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
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 leading-tight">
                        Modifier le <span className="text-orange-600 italic font-serif">Produit.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Mettez à jour les informations et les variantes du produit.
                    </p>
                </div>
            </div>
            <ProductForm editingProduct={product} />
        </div>
    );
}
