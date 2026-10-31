import recipesData from "@/data/recipes.json";
import type { CalcState } from "@/lib/crafts";

// Recipes come from src/data/recipes.json, made by scripts/import-recipes.mjs.
export type Recipe = {
  id: number;
  recipeItemId: number;
  level: number; // "Create Item" skill level needed
  type: "dwarven" | "common";
  successRate: number; // percent
  mp: number;
  product: { id: number; name: string; count: number };
  ingredients: { id: number; name: string; count: number }[];
};

const recipes = recipesData as Recipe[];

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipe(id: number): Recipe | null {
  return recipes.find((r) => r.id === id) ?? null;
}

/** Small version of a recipe for the searchable list (keeps the page light). */
export type RecipeListItem = {
  id: number;
  name: string;
  count: number;
  level: number;
  type: Recipe["type"];
  successRate: number;
  materials: string[];
};

export function toListItem(r: Recipe): RecipeListItem {
  return {
    id: r.id,
    name: r.product.name,
    count: r.product.count,
    level: r.level,
    type: r.type,
    successRate: r.successRate,
    materials: r.ingredients.map((i) => i.name),
  };
}

/** Starting values for the calculator on a recipe page. */
export function toCalcState(r: Recipe): CalcState {
  return {
    productName: r.product.name,
    successRate: r.successRate,
    productCount: r.product.count,
    productPrice: 0,
    attempts: 1,
    materials: r.ingredients.map((i) => ({ name: i.name, qty: i.count, price: 0 })),
  };
}
