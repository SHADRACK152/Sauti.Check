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

// Mock AI chatbot response generator
const generateChatbotResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hujambo')) {
    return "Hujambo! I'm Sauti, your civic assistant. I can help you with fact-checking, civic information, voting procedures, government services, and navigating this platform. What would you like to know?";
  }
  
  // Fact-checking queries
  if (lowerMessage.includes('fact check') || lowerMessage.includes('verify') || lowerMessage.includes('true') || lowerMessage.includes('false')) {
    return "I can help you verify information! You can use our fact-checking tool on this platform, or ask me specific questions about claims you've heard. For the most accurate results, please provide the specific claim you'd like me to analyze.";
  }
  
  // Voting information
  if (lowerMessage.includes('vote') || lowerMessage.includes('election') || lowerMessage.includes('iebc')) {
    return "For voting information in Kenya, you can register with IEBC (Independent Electoral and Boundaries Commission). Check our civic alerts section for current registration deadlines and polling station information. You need a valid national ID and must be 18 or older to register.";
  }
  
  // Government services
  if (lowerMessage.includes('government') || lowerMessage.includes('service') || lowerMessage.includes('permit') || lowerMessage.includes('license')) {
    return "For government services in Kenya, you can visit eCitizen portal online or local Huduma Centers. Common services include permits, licenses, certificates, and tax services. Check our jobs section for current government opportunities too.";
  }
  
  // Platform navigation
  if (lowerMessage.includes('how') || lowerMessage.includes('navigate') || lowerMessage.includes('use')) {
    return "I can guide you through SautiCheck! We have: News Feed (latest verified civic news), Fact Checker (verify claims), Civic Alerts (important announcements), Jobs Hub (employment opportunities), and Bookmarks (save articles). What specific feature would you like help with?";
  }
  
  // News and information
  if (lowerMessage.includes('news') || lowerMessage.includes('information') || lowerMessage.includes('update')) {
    return "Stay informed with our verified news feed! We cover Politics, Economy, Education, Health, and Infrastructure. All articles are fact-checked and sourced from reliable media outlets. You can filter by category or bookmark articles for later reading.";
  }
  
  // Jobs
  if (lowerMessage.includes('job') || lowerMessage.includes('employment') || lowerMessage.includes('work') || lowerMessage.includes('career')) {
    return "Check our Jobs Hub for verified employment opportunities from trusted organizations like Safaricom, Equity Bank, and government agencies. We offer full-time, part-time, contract, and internship positions across Kenya.";
  }
  
  // Civic engagement
  if (lowerMessage.includes('civic') || lowerMessage.includes('participate') || lowerMessage.includes('community')) {
    return "Great to hear you want to engage civically! Check our Civic Alerts for public participation opportunities, budget hearings, and community meetings. Stay informed through our news feed and always verify information before sharing.";
  }
  
  // Default response
  return "I'm here to help with civic information, fact-checking, and navigating SautiCheck. You can ask me about voting procedures, government services, news verification, or how to use different features of this platform. What specific topic interests you?";
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

  // Sauti Chatbot route
  app.post("/api/chat", authenticateToken, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Mock AI chatbot responses (replace with actual AI service integration)
      const response = generateChatbotResponse(message);
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
