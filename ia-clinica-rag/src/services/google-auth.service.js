import crypto from "crypto";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

/**
 * Serviço de Autenticação Google OAuth 2.0 & Gestão de Usuários (MedIa v2.0)
 * Elimina senhas tradicionais e utiliza autenticação federada com Google.
 */
class GoogleAuthService {
  constructor() {
    this.inMemoryUsers = new Map();
    this.seedDefaultUsers();
  }

  seedDefaultUsers() {
    const demoId = `usr_${crypto.randomBytes(8).toString("hex")}`;
    const demoUser = {
      userId: demoId,
      email: "medico.demo@media.med.br",
      name: "Dr. Karlson Gabriel",
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      plan: "medico",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      crm: "98765-MG",
      specialty: "Clínica Geral & Medicina Interna"
    };

    const studentId = `usr_${crypto.randomBytes(8).toString("hex")}`;
    const studentUser = {
      userId: studentId,
      email: "estudante.med@unimontes.br",
      name: "Lucas Silveira (Internato)",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      plan: "estudante",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      crm: null,
      specialty: "Acadêmico de Medicina"
    };

    this.inMemoryUsers.set(demoUser.userId, demoUser);
    this.inMemoryUsers.set(demoUser.email, demoUser);
    this.inMemoryUsers.set(studentUser.userId, studentUser);
    this.inMemoryUsers.set(studentUser.email, studentUser);
  }

  /**
   * Processa autenticação Google (OAuth 2.0 / Credential Payload)
   */
  async authenticateWithGoogle({ googleId, email, name, photo, selectedPlan = "free" }) {
    if (!email || typeof email !== "string") {
      throw new Error("E-mail do Google é obrigatório.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const userId = googleId ? String(googleId) : `google_${crypto.createHash("sha256").update(cleanEmail).digest("hex").slice(0, 16)}`;
    let user = this.inMemoryUsers.get(cleanEmail) || this.inMemoryUsers.get(userId);

    if (user) {
      user.lastLogin = new Date().toISOString();
      if (photo) user.photo = photo;
      if (name) user.name = name;
      if (selectedPlan && selectedPlan !== "free" && user.plan === "free") {
        user.plan = selectedPlan;
      }
    } else {
      user = {
        userId,
        email: cleanEmail,
        name: name ? String(name).slice(0, 100) : cleanEmail.split("@")[0],
        photo: photo || null,
        plan: selectedPlan,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        crm: null,
        specialty: null
      };

      this.inMemoryUsers.set(userId, user);
      this.inMemoryUsers.set(cleanEmail, user);
    }

    const token = this.generateSessionToken(user);
    return { token, user };
  }

  generateSessionToken(user) {
    const payload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      plan: user.plan,
      photo: user.photo
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d"
    });
  }

  verifySessionToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  getUserById(userId) {
    return this.inMemoryUsers.get(userId) || null;
  }
}

export const googleAuthService = new GoogleAuthService();
