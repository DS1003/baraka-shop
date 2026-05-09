import ProductForm from '../_components/ProductForm';

export const metadata = {
    title: 'Créer un Produit | Admin',
};

export default function NewProductPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-1.5">
                <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                    Nouveau <span className="text-orange-600">Produit.</span>
                </h1>
                <p className="text-[15px] text-slate-500 font-medium">
                    Ajoutez un nouveau produit à votre catalogue.
                </p>
            </div>
            <ProductForm />
        </div>
    );
}
