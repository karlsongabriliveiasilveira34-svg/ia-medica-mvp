import crypto from "crypto";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET || "media-clinical-super-secret-key-2026-v2";

/**
 * Serviço de Autenticação Google OAuth 2.0 & Gestão de Usuários (MedIa v2.0)
 * Elimina senhas tradicionais e utiliza autenticação federada com Google.
 */
class GoogleAuthService {
  constructor() {
    // Armazenamento em memória resiliente para usuários da sessão
    this.inMemoryUsers = new Map();
    this.seedDefaultUsers();
  }

  seedDefaultUsers() {
    const demoUser = {
      userId: "google_user_demo_001",
      email: "medico.demo@media.med.br",
      name: "Dr. Karlson Gabriel",
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      plan: "medico", // 'free', 'estudante', 'clinica', 'medico'
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      crm: "98765-MG",
      specialty: "Clínica Geral & Medicina Interna"
    };

    const studentUser = {
      userId: "google_user_student_002",
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
    if (!email) {
      throw new Error("E-mail do Google é obrigatório.");
    }

    const userId = googleId || `google_${crypto.createHash("md5").update(email).digest("hex")}`;
    let user = this.inMemoryUsers.get(email) || this.inMemoryUsers.get(userId);

    if (user) {
      // Atualizar último login
      user.lastLogin = new Date().toISOString();
      if (name) user.name = name;
      if (photo) user.photo = photo;
    } else {
      // Criar novo usuário com plano Free (ou o plano selecionado)
      user = {
        userId,
        email: email.toLowerCase().trim(),
        name: name || email.split("@")[0],
        photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=213f34&color=fff`,
        plan: selectedPlan || "free",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        paymentHistory: []
      };

      this.inMemoryUsers.set(userId, user);
      this.inMemoryUsers.set(user.email, user);
    }

    // Persistir no PostgreSQL se disponível
    try {
      await query(
        `INSERT INTO users (id, full_name, email, role, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name`,
        [user.userId, user.name, user.email, user.plan, user.createdAt]
      );
    } catch (dbErr) {
      // Fallback gracioso para memória
    }

    const token = this.generateSessionToken(user);

    return {
      token,
      user
    };
  }

  /**
   * Login rápido de demonstração (1 clique)
   */
  async authenticateDemoUser(planType = "medico") {
    const isStudent = planType === "estudante";
    const user = isStudent 
      ? this.inMemoryUsers.get("estudante.med@unimontes.br")
      : this.inMemoryUsers.get("medico.demo@media.med.br");

    user.plan = planType;
    user.lastLogin = new Date().toISOString();

    const token = this.generateSessionToken(user);
    return { token, user };
  }

  /**
   * Gera Token JWT de Sessão (expira em 7 dias)
   */
  generateSessionToken(user) {
    return jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        plan: user.plan,
        photo: user.photo
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
  }

  /**
   * Valida e decodifica o Token JWT
   */
  verifySessionToken(token) {
    try {
      if (!token) return null;
      const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
      return jwt.verify(cleanToken, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Obtém os dados do usuário pelo ID ou Email
   */
  getUser(userIdOrEmail) {
    return this.inMemoryUsers.get(userIdOrEmail) || null;
  }

  /**
   * Atualiza o plano do usuário (após upgrade ou PIX)
   */
  updateUserPlan(userIdOrEmail, newPlan) {
    const user = this.getUser(userIdOrEmail);
    if (!user) return null;

    user.plan = newPlan;
    return user;
  }
}

export const googleAuthService = new GoogleAuthService();
