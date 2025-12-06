export class CreateMealDto {
    name: string;
    foods: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        amount: number;
        unit: string;
    }[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    imageUrl?: string;
}
