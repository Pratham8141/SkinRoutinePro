import { type User, type InsertUser, type Assessment, type InsertAssessment, type Routine, type InsertRoutine, type Product, type InsertProduct, type Ingredient, type InsertIngredient, type RoutineStep } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAllergies(userId: string, allergies: string[]): Promise<User | undefined>;

  // Assessment methods
  createAssessment(assessment: InsertAssessment & { userId: string }): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getUserAssessments(userId: string): Promise<Assessment[]>;

  // Routine methods
  createRoutine(routine: InsertRoutine & { userId: string }): Promise<Routine>;
  getRoutine(id: string): Promise<Routine | undefined>;
  getUserRoutines(userId: string): Promise<Routine[]>;
  updateRoutineActive(id: string, isActive: boolean): Promise<Routine | undefined>;
  deleteRoutine(id: string): Promise<boolean>;

  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByFilters(filters: {
    skinTypes?: string[];
    concerns?: string[];
    category?: string;
    isHomeRemedy?: boolean;
  }): Promise<Product[]>;

  // Ingredient methods
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  getIngredient(id: string): Promise<Ingredient | undefined>;
  getIngredientByName(name: string): Promise<Ingredient | undefined>;
  getAllIngredients(): Promise<Ingredient[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assessments: Map<string, Assessment>;
  private routines: Map<string, Routine>;
  private products: Map<string, Product>;
  private ingredients: Map<string, Ingredient>;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.routines = new Map();
    this.products = new Map();
    this.ingredients = new Map();
    this.seedData();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, allergies: [] };
    this.users.set(id, user);
    return user;
  }

  async updateUserAllergies(userId: string, allergies: string[]): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updatedUser = { ...user, allergies };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Assessment methods
  async createAssessment(assessment: InsertAssessment & { userId: string }): Promise<Assessment> {
    const id = randomUUID();
    const newAssessment: Assessment = { 
      ...assessment, 
      id,
      concerns: assessment.concerns ? Array.from(assessment.concerns) : [],
      lifestyle: assessment.lifestyle || {}
    };
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(a => a.userId === userId);
  }

  // Routine methods
  async createRoutine(routine: InsertRoutine & { userId: string }): Promise<Routine> {
    const id = randomUUID();
    const newRoutine: Routine = { 
      ...routine, 
      id, 
      isActive: true,
      morningSteps: routine.morningSteps ? Array.from(routine.morningSteps) : [],
      eveningSteps: routine.eveningSteps ? Array.from(routine.eveningSteps) : []
    };
    this.routines.set(id, newRoutine);
    return newRoutine;
  }

  async getRoutine(id: string): Promise<Routine | undefined> {
    return this.routines.get(id);
  }

  async getUserRoutines(userId: string): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(r => r.userId === userId);
  }

  async updateRoutineActive(id: string, isActive: boolean): Promise<Routine | undefined> {
    const routine = this.routines.get(id);
    if (!routine) return undefined;
    const updatedRoutine = { ...routine, isActive };
    this.routines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  async deleteRoutine(id: string): Promise<boolean> {
    return this.routines.delete(id);
  }

  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { 
      ...product, 
      id,
      skinTypes: product.skinTypes ? Array.from(product.skinTypes) : [],
      concerns: product.concerns ? Array.from(product.concerns) : [],
      ingredients: product.ingredients ? Array.from(product.ingredients) : [],
      warnings: product.warnings ? Array.from(product.warnings) : []
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByFilters(filters: {
    skinTypes?: string[];
    concerns?: string[];
    category?: string;
    isHomeRemedy?: boolean;
  }): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => {
      if (filters.skinTypes && !filters.skinTypes.some(type => product.skinTypes.includes(type))) {
        return false;
      }
      if (filters.concerns && !filters.concerns.some(concern => product.concerns.includes(concern))) {
        return false;
      }
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.isHomeRemedy !== undefined && product.isHomeRemedy !== filters.isHomeRemedy) {
        return false;
      }
      return true;
    });
  }

  // Ingredient methods
  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const id = randomUUID();
    const newIngredient: Ingredient = { 
      ...ingredient, 
      id,
      description: ingredient.description || null,
      benefits: ingredient.benefits ? Array.from(ingredient.benefits) : [],
      warnings: ingredient.warnings ? Array.from(ingredient.warnings) : [],
      commonAllergens: ingredient.commonAllergens ? Array.from(ingredient.commonAllergens) : []
    };
    this.ingredients.set(id, newIngredient);
    return newIngredient;
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async getIngredientByName(name: string): Promise<Ingredient | undefined> {
    return Array.from(this.ingredients.values()).find(ing => ing.name.toLowerCase() === name.toLowerCase());
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  private seedData() {
    // Seed ingredients
    const commonIngredients: Array<{
      name: string;
      description: string;
      benefits: string[];
      warnings: string[];
      safetyLevel: string;
      commonAllergens: string[];
    }> = [
      { name: "Salicylic Acid", description: "Beta-hydroxy acid for exfoliation", benefits: ["Unclogs pores", "Reduces acne"], warnings: [], safetyLevel: "safe", commonAllergens: [] },
      { name: "Niacinamide", description: "Vitamin B3 derivative", benefits: ["Reduces pore appearance", "Controls oil"], warnings: [], safetyLevel: "safe", commonAllergens: [] },
      { name: "Retinol", description: "Vitamin A derivative for anti-aging", benefits: ["Reduces fine lines", "Improves texture"], warnings: ["Sun sensitivity", "Not for pregnant women"], safetyLevel: "caution", commonAllergens: [] },
      { name: "Fragrance", description: "Synthetic or natural scent", benefits: [], warnings: ["May cause irritation"], safetyLevel: "warning", commonAllergens: ["sensitive skin"] },
      { name: "Hyaluronic Acid", description: "Humectant for hydration", benefits: ["Retains moisture", "Plumps skin"], warnings: [], safetyLevel: "safe", commonAllergens: [] },
    ];

    commonIngredients.forEach(ing => {
      const id = randomUUID();
      this.ingredients.set(id, { ...ing, id });
    });

    // Seed products
    const products: Array<{
      name: string;
      brand: string;
      category: string;
      skinTypes: string[];
      concerns: string[];
      ingredients: string[];
      price: number;
      rating: number;
      isHomeRemedy: boolean;
      instructions: string;
      warnings: string[];
    }> = [
      {
        name: "CeraVe Hydrating Cleanser",
        brand: "CeraVe",
        category: "Cleanser",
        skinTypes: ["dry", "sensitive", "normal"],
        concerns: ["dryness", "sensitivity"],
        ingredients: ["Hyaluronic Acid", "Ceramides"],
        price: 1399, // $13.99
        rating: 4,
        isHomeRemedy: false,
        instructions: "Apply to wet skin, massage gently, rinse thoroughly",
        warnings: []
      },
      {
        name: "Honey Oat Cleanser",
        brand: "DIY",
        category: "Cleanser",
        skinTypes: ["dry", "sensitive", "normal"],
        concerns: ["dryness", "sensitivity", "dullness"],
        ingredients: ["Raw Honey", "Ground Oats"],
        price: 500, // $5.00 for ingredients
        rating: 4,
        isHomeRemedy: true,
        instructions: "Mix 2 tbsp honey with 1 tbsp ground oats, apply to face, massage for 1 minute, rinse with warm water",
        warnings: ["Patch test recommended for honey allergies"]
      },
      {
        name: "The Ordinary Niacinamide 10% + Zinc 1%",
        brand: "The Ordinary",
        category: "Serum",
        skinTypes: ["oily", "combination", "acne-prone"],
        concerns: ["acne", "large-pores", "oiliness"],
        ingredients: ["Niacinamide", "Zinc"],
        price: 699, // $6.99
        rating: 4,
        isHomeRemedy: false,
        instructions: "Apply 2-3 drops to clean skin before moisturizer",
        warnings: []
      }
    ];

    products.forEach(prod => {
      const id = randomUUID();
      this.products.set(id, { ...prod, id });
    });
  }
}

export const storage = new MemStorage();
