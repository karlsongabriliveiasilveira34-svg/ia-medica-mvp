import { generateToken } from '../src/utils/token.util.js';
import { env } from '../src/config/env.js';

// Ler argumentos da linha de comando (ex: node scripts/generate-jwt.js --days=30 --clinic="Clinica Sao Paulo")
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.split('=');
  if (key && val) {
    acc[key.replace(/^--/, '')] = val.replace(/^["']|["']$/g, '');
  }
  return acc;
}, {});

const days = Number(args.days || 30);
const hours = days * 24;
const clinic = args.clinic || args.name || "Clínica Demonstração";
const role = args.role || "clinica_demo";

const payload = {
  role,
  clinic,
  issuedAt: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
};

const token = generateToken(payload, hours);

console.log("\n=======================================================");
console.log("🔑 GERADOR DE TOKEN JWT - IA CLÍNICA RAG");
console.log("=======================================================");
console.log(`🏥 Clínica:      ${clinic}`);
console.log(`👤 Role/Perfil:  ${role}`);
console.log(`⏳ Validade:     ${days} dias (${hours} horas)`);
console.log(`🔐 Secret Key:   ${env.jwtSecret.slice(0, 5)}***`);
console.log("-------------------------------------------------------");
console.log("🎫 TOKEN JWT GERADO:");
console.log(`\n${token}\n`);
console.log("-------------------------------------------------------");
console.log("📌 Como usar no Postman / Insomnia / Curl:");
console.log(`Header: Authorization`);
console.log(`Value:  Bearer ${token}`);
console.log("=======================================================\n");
