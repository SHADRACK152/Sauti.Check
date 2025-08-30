import { type User, type InsertUser, type Article, type InsertArticle, type CivicAlert, type InsertCivicAlert, type Job, type InsertJob, type FactCheck, type InsertFactCheck } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Article methods
  getArticles(limit?: number, offset?: number, category?: string): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;

  // Civic Alert methods
  getCivicAlerts(limit?: number): Promise<CivicAlert[]>;
  createCivicAlert(alert: InsertCivicAlert): Promise<CivicAlert>;

  // Job methods
  getJobs(limit?: number, type?: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;

  // Fact Check methods
  createFactCheck(factCheck: InsertFactCheck): Promise<FactCheck>;
  getFactChecksByUser(userId: string): Promise<FactCheck[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private articles: Map<string, Article>;
  private civicAlerts: Map<string, CivicAlert>;
  private jobs: Map<string, Job>;
  private factChecks: Map<string, FactCheck>;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.civicAlerts = new Map();
    this.jobs = new Map();
    this.factChecks = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed default admin user if not present
    const adminEmail = "admin@sauticheck.com";
    if (!Array.from(this.users.values()).find(u => u.email === adminEmail)) {
      const id = randomUUID();
      this.users.set(id, {
        id,
        username: "admin",
        email: adminEmail,
        password: "$2b$10$mbTgI9Ke9PlA9LzSnBXyE.YDMtDpRVssEm4etuZSgnD/jJNNWHq6C", // hash for 'admin123'
        firstName: "Admin",
        lastName: "User",
        location: "HQ",
        role: "admin",
        articlesRead: 0,
        factsChecked: 0,
        bookmarksCount: 0,
        createdAt: new Date(),
      });
    }
    // Seed some initial data
    const sampleArticles: Article[] = [
      {
        id: randomUUID(),
        title: "Kenya Parliament Passes New Economic Stimulus Package",
        excerpt: "The National Assembly approved a comprehensive economic stimulus package aimed at supporting small businesses and creating employment opportunities for youth across the country.",
        content: "The Kenyan Parliament has unanimously passed a landmark economic stimulus package...",
        category: "Politics",
        source: "The Daily Nation",
        author: "Jane Wanjiku",
        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=300&fit=crop",
        verified: true,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Nairobi County Unveils New Urban Development Plan",
        excerpt: "The county government announced a comprehensive urban development strategy focusing on affordable housing and improved transportation infrastructure.",
        content: "Nairobi County Governor announced a comprehensive urban development plan...",
        category: "Infrastructure",
        source: "Standard Digital",
        author: "Peter Maina",
        imageUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&h=300&fit=crop",
        verified: true,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "New University Scholarship Program Launched",
        excerpt: "The Ministry of Education announced a new scholarship initiative targeting students from marginalized communities across Kenya.",
        content: "The Ministry of Education has launched a comprehensive scholarship program...",
        category: "Education",
        source: "Capital FM",
        author: "Sarah Kiprotich",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=300&fit=crop",
        verified: true,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Healthcare Workers Strike Called Off",
        excerpt: "The Kenya Medical Practitioners union reached an agreement with the government ending the month-long strike action.",
        content: "After weeks of negotiations, the healthcare workers strike has been called off...",
        category: "Health",
        source: "Nation Media",
        author: "Dr. James Mwangi",
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=300&fit=crop",
        verified: true,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Youth Employment Initiative Creates 10,000 Jobs",
        excerpt: "A new government initiative in partnership with private sector aims to create sustainable employment opportunities for young Kenyans.",
        content: "The government has launched an ambitious youth employment initiative...",
        category: "Economy",
        source: "Business Daily",
        author: "Mary Njoki",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop",
        verified: true,
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        createdAt: new Date(),
      },
    ];

    sampleArticles.forEach(article => this.articles.set(article.id, article));

    // Seed civic alerts
    const sampleAlerts: CivicAlert[] = [
      {
        id: randomUUID(),
        title: "Voter Registration",
        message: "IEBC opens voter registration centers across Nairobi. Register by December 15th.",
        type: "info",
        category: "Elections",
        actionText: "Learn More",
        actionUrl: "#",
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: randomUUID(),
        title: "Public Hearing",
        message: "County budget hearing scheduled for Thursday at KICC. Public participation welcome.",
        type: "info",
        category: "Budget",
        actionText: "Attend",
        actionUrl: "#",
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        id: randomUUID(),
        title: "Tax Deadline",
        message: "KRA reminds taxpayers of the December 31st deadline for annual returns filing.",
        type: "warning",
        category: "Tax",
        actionText: "File Now",
        actionUrl: "#",
        isActive: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    sampleAlerts.forEach(alert => this.civicAlerts.set(alert.id, alert));

    // Seed jobs
    const sampleJobs: Job[] = [
      {
        id: randomUUID(),
        title: "Software Developer",
        company: "Safaricom PLC",
        location: "Nairobi, Kenya",
        type: "full-time",
        description: "We are looking for a talented software developer to join our digital innovation team.",
        requirements: "Bachelor's degree in Computer Science, 2+ years experience in software development, proficiency in JavaScript and Python.",
        salary: "KSh 80,000 - 120,000",
        applicationUrl: "https://safaricom.co.ke/careers",
        postedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        id: randomUUID(),
        title: "Marketing Intern",
        company: "Equity Bank",
        location: "Nairobi, Kenya",
        type: "internship",
        description: "Join our marketing team as an intern and gain hands-on experience in digital marketing and brand management.",
        requirements: "Currently pursuing a degree in Marketing, Business, or related field. Strong communication skills and creativity.",
        salary: "KSh 25,000 stipend",
        applicationUrl: "https://equitybank.co.ke/careers",
        postedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      },
      {
        id: randomUUID(),
        title: "Junior Accountant",
        company: "Kenya Commercial Bank",
        location: "Mombasa, Kenya",
        type: "full-time",
        description: "We are seeking a detail-oriented junior accountant to support our finance team.",
        requirements: "Bachelor's degree in Accounting or Finance, CPA Part I preferred, 1+ year experience.",
        salary: "KSh 60,000 - 80,000",
        applicationUrl: "https://kcbgroup.com/careers",
        postedAt: new Date(),
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      },
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      articlesRead: 0,
      factsChecked: 0,
      bookmarksCount: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getArticles(limit = 10, offset = 0, category?: string): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (category) {
      articles = articles.filter(article => article.category === category);
    }
    
    return articles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      ...insertArticle,
      id,
      publishedAt: new Date(),
      createdAt: new Date(),
    };
    this.articles.set(id, article);
    return article;
  }

  async getCivicAlerts(limit = 10): Promise<CivicAlert[]> {
    return Array.from(this.civicAlerts.values())
      .filter(alert => alert.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createCivicAlert(insertAlert: InsertCivicAlert): Promise<CivicAlert> {
    const id = randomUUID();
    const alert: CivicAlert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
    };
    this.civicAlerts.set(id, alert);
    return alert;
  }

  async getJobs(limit = 10, type?: string): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }
    
    return jobs
      .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
      .slice(0, limit);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      postedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async createFactCheck(insertFactCheck: InsertFactCheck): Promise<FactCheck> {
    const id = randomUUID();
    const factCheck: FactCheck = {
      ...insertFactCheck,
      id,
      createdAt: new Date(),
    };
    this.factChecks.set(id, factCheck);
    return factCheck;
  }

  async getFactChecksByUser(userId: string): Promise<FactCheck[]> {
    return Array.from(this.factChecks.values())
      .filter(fc => fc.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
