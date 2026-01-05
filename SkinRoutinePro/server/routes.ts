import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssessmentSchema, insertRoutineSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create user (in production, hash password)
      const { confirmPassword, ...userToCreate } = userData;
      const user = await storage.createUser(userToCreate);
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const { userId, ...assessmentData } = req.body;
      const validatedData = insertAssessmentSchema.parse(assessmentData);
      
      const assessment = await storage.createAssessment({ ...validatedData, userId });
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.get("/api/assessments/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const assessments = await storage.getUserAssessments(userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Routine routes
  app.post("/api/routines", async (req, res) => {
    try {
      const { userId, ...routineData } = req.body;
      const validatedData = insertRoutineSchema.parse(routineData);
      
      const routine = await storage.createRoutine({ ...validatedData, userId });
      res.json(routine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create routine" });
    }
  });

  app.get("/api/routines/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const routines = await storage.getUserRoutines(userId);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routines" });
    }
  });

  app.patch("/api/routines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const routine = await storage.updateRoutineActive(id, isActive);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to update routine" });
    }
  });

  app.delete("/api/routines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRoutine(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      res.json({ message: "Routine deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete routine" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { skinTypes, concerns, category, isHomeRemedy } = req.query;
      
      const filters: any = {};
      if (skinTypes) filters.skinTypes = Array.isArray(skinTypes) ? skinTypes : [skinTypes];
      if (concerns) filters.concerns = Array.isArray(concerns) ? concerns : [concerns];
      if (category) filters.category = category;
      if (isHomeRemedy !== undefined) filters.isHomeRemedy = isHomeRemedy === 'true';
      
      const products = await storage.getProductsByFilters(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Ingredient routes
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredients" });
    }
  });

  app.get("/api/ingredients/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const ingredient = await storage.getIngredientByName(decodeURIComponent(name));
      
      if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredient" });
    }
  });

  // Routine generation endpoint
  app.post("/api/routines/generate", async (req, res) => {
    try {
      const { assessment, preferenceType, season = "winter" } = req.body;
      
      // Generate routine based on assessment
      const products = await storage.getProductsByFilters({
        skinTypes: [assessment.skinType],
        concerns: assessment.concerns,
        isHomeRemedy: preferenceType === 'home-remedies'
      });

      // Generate morning routine
      const morningSteps = [
        {
          stepNumber: 1,
          title: "Gentle Cleanser",
          description: "Remove overnight buildup with a hydrating cleanser",
          products: products.filter(p => p.category === "Cleanser").slice(0, 2).map(p => ({
            id: p.id,
            name: p.name,
            type: p.isHomeRemedy ? 'home-remedy' as const : 'commercial' as const,
            instructions: p.instructions
          }))
        },
        {
          stepNumber: 2,
          title: "Treatment Serum",
          description: "Target specific concerns with active ingredients",
          products: products.filter(p => p.category === "Serum").slice(0, 2).map(p => ({
            id: p.id,
            name: p.name,
            type: p.isHomeRemedy ? 'home-remedy' as const : 'commercial' as const,
            instructions: p.instructions
          }))
        },
        {
          stepNumber: 3,
          title: "Moisturizer",
          description: "Lock in hydration and create protective barrier",
          products: []
        },
        {
          stepNumber: 4,
          title: "Sunscreen (SPF 30+)",
          description: "Essential UV protection - never skip!",
          products: []
        }
      ];

      // Generate evening routine
      const eveningSteps = [
        {
          stepNumber: 1,
          title: "Double Cleanse",
          description: "Remove makeup and sunscreen thoroughly",
          products: products.filter(p => p.category === "Cleanser").slice(0, 2).map(p => ({
            id: p.id,
            name: p.name,
            type: p.isHomeRemedy ? 'home-remedy' as const : 'commercial' as const,
            instructions: p.instructions
          }))
        },
        {
          stepNumber: 2,
          title: "Treatment Serum",
          description: "Target specific concerns with active ingredients",
          products: products.filter(p => p.category === "Serum").slice(0, 2).map(p => ({
            id: p.id,
            name: p.name,
            type: p.isHomeRemedy ? 'home-remedy' as const : 'commercial' as const,
            instructions: p.instructions
          }))
        },
        {
          stepNumber: 3,
          title: "Night Moisturizer",
          description: "Rich hydration for overnight repair",
          products: []
        }
      ];

      res.json({
        morningSteps,
        eveningSteps,
        seasonalAdjustments: {
          season,
          adjustments: [
            {
              stepTitle: "Moisturizer",
              modification: "Use extra hydrating formula",
              reason: "Winter air is drier and can dehydrate skin"
            }
          ]
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate routine" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
