export interface Product {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    isNew?: boolean;
    isSale?: boolean;
}
