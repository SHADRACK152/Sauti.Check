import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema, factCheckRequestSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Mock AI fact checker (in real app, integrate with actual AI service)
const mockFactChecker = (text: string) => {
  const words = text.toLowerCase();
  let confidence = 75; // base confidence
  let result = "unverified";
  let explanation = "This claim requires further verification from authoritative sources.";

  // Simple keyword-based mock logic
  if (words.includes("fake") || words.includes("false") || words.includes("hoax")) {
    result = "false";
    confidence = 85;
    explanation = "This appears to contain false information based on available evidence.";
  } else if (words.includes("true") || words.includes("verified") || words.includes("confirmed")) {
    result = "true";
    confidence = 90;
    explanation = "This information appears to be accurate based on current evidence.";
  } else if (words.includes("partly") || words.includes("some") || words.includes("mixed")) {
    result = "partly-true";
    confidence = 70;
    explanation = "This claim contains some accurate information but may be missing context.";
  }

  return { result, confidence, explanation };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location || "Kenya",
        role: data.role || "user",
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          role: user.role,
          articlesRead: user.articlesRead,
          factsChecked: user.factsChecked,
          bookmarksCount: user.bookmarksCount,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          role: user.role,
          articlesRead: user.articlesRead,
          factsChecked: user.factsChecked,
          bookmarksCount: user.bookmarksCount,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        location: req.user.location,
        role: req.user.role,
        articlesRead: req.user.articlesRead,
        factsChecked: req.user.factsChecked,
        bookmarksCount: req.user.bookmarksCount,
      },
    });
  });

  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;

      const articles = await storage.getArticles(limit, offset, category);
      res.json({ articles });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json({ article });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Civic alerts routes
  app.get("/api/civic-alerts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const alerts = await storage.getCivicAlerts(limit);
      res.json({ alerts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch civic alerts" });
    }
  });

  // Jobs routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const jobs = await storage.getJobs(limit, type);
      res.json({ jobs });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Fact check routes
  app.post("/api/fact-check", authenticateToken, async (req: any, res) => {
    try {
      const data = factCheckRequestSchema.parse(req.body);
      
      // Mock AI fact checking (replace with real AI service)
      const result = mockFactChecker(data.text);
      
      // Save fact check to storage
      const factCheck = await storage.createFactCheck({
        userId: req.user.id,
        text: data.text,
        result: result.result,
        confidence: result.confidence,
        explanation: result.explanation,
        sources: null,
      });

      // Update user's fact check count
      await storage.updateUser(req.user.id, {
        factsChecked: req.user.factsChecked + 1,
      });

      res.json({ factCheck });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to perform fact check" });
    }
  });

  app.get("/api/fact-checks", authenticateToken, async (req: any, res) => {
    try {
      const factChecks = await storage.getFactChecksByUser(req.user.id);
      res.json({ factChecks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fact checks" });
    }
  });

  // Admin routes
  app.post("/api/admin/articles", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const article = await storage.createArticle(req.body);
      res.status(201).json({ article });
    } catch (error) {
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.post("/api/admin/civic-alerts", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const alert = await storage.createCivicAlert(req.body);
      res.status(201).json({ alert });
    } catch (error) {
      res.status(500).json({ message: "Failed to create civic alert" });
    }
  });

  app.post("/api/admin/jobs", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const job = await storage.createJob(req.body);
      res.status(201).json({ job });
    } catch (error) {
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
