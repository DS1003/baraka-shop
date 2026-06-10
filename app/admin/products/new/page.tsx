import ProductForm from '../_components/ProductForm';

export const metadata = {
    title: 'Créer un Produit | Admin',
};

export default function NewProductPage() {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 leading-tight">
                        Nouveau <span className="text-orange-600 italic font-serif">Produit.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Ajoutez un nouveau produit à votre catalogue.
                    </p>
                </div>
            </div>
            <ProductForm />
        </div>
    );
}
