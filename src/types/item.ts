export interface Item {
    id: string;
    name: string;
    description: string;
    image: string;
    basePrice: number; // The true base price before randomization
    type: string;
    category: string;
    isFixed: boolean; // True for items like void and travel stipend
}