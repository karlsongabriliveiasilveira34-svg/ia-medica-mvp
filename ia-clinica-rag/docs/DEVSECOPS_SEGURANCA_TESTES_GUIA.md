# 🛡️ Guia Completo de Segurança, Testes & DevSecOps — MedIA

Este documento consolida a arquitetura de **Segurança, Análise Estática (SAST), Análise Dinâmica (DAST), Verificação de Dependências (SCA), Testes Automatizados (QA) e Secret Scanning** integrada ao projeto MedIA.

---

## 📊 Matriz das 7 Categorias de Segurança Integradas

| Categoria | Ferramenta Principal | Função no MedIA | Arquivo de Configuração |
| :--- | :--- | :--- | :--- |
| **1. SAST (Static Analysis)** | **Semgrep + SonarQube** | Varredura estática de código para OWASP Top 10 e CWE Top 25 | `.semgrep.yml`, `sonar-project.properties` |
| **2. DAST (Dynamic Analysis)** | **OWASP ZAP + Nuclei** | Teste de segurança com a aplicação em execução (injeção, XSS, CORS) | `.github/workflows/security.yml` |
| **3. Verificação de Dependências** | **Snyk + npm audit** | Detecção de CVEs e vulnerabilidades em bibliotecas de terceiros | `.snyk`, `package.json` |
| **4. QA & Testes de Código** | **Jest / Supertest / Custom Runner** | Testes unitários, de rotas REST, roadmaps e acervo de questões | `tests/`, `scripts/security-audit-check.js` |
| **5. Code Quality & Linting** | **ESLint + Prettier** | Padronização de código, prevenção de bugs e formatação limpa | `.prettierrc`, `.prettierignore` |
| **6. Container & Infra** | **Trivy + Hadolint** | Scan de vulnerabilidades em Dockerfile e imagens OCI | `.github/workflows/security.yml` |
| **7. Secret Scanning** | **TruffleHog + Gitleaks** | Impedir commit e vazamento de chaves de API, senhas e JWTs | `.gitleaks.toml` |

---

## 🚀 Como Executar Localmente

### 1. Auditoria Completa de Segurança e SAST
```bash
npm run security:check
```
Executa a análise estática em todos os arquivos `src/` e `frontend/src/`, verificando:
- Injeções de SQL e sanitização de queries
- Uso de `eval()` e funções de alto risco
- Chaves privadas / segredos hardcoded
- Hash criptográfico com `bcrypt` (salt rounds >= 10)

### 2. Auditoria de Dependências
```bash
npm run security:audit
```
Escaneia vulnerabilidades em bibliotecas no `package.json` e `package-lock.json`.

### 3. Bateria Completa de Testes Automatizados
```bash
npm test
```
Executa todos os testes do acervo de 5.047 questões MedMCQA, 5.021 flashcards, roadmaps de residência e matriz UNIMONTES de 12 períodos.

---

## ⚙️ Pipeline CI/CD no GitHub Actions

O arquivo [`.github/workflows/security.yml`](file:///c:/Users/karls/OneDrive/Desktop/Ia%20medica/.github/workflows/security.yml) é acionado automaticamente em cada `push` e `pull_request` para as branches principais (`main`, `master`, `develop`):

1. **`sast_scan`**: Executa o Semgrep Action com os pacotes `p/owasp-top-ten`, `p/cwe-top-25`, `p/javascript` e `p/nodejs`.
2. **`secret_scan`**: Executa o TruffleHog para verificar todo o histórico git em busca de credenciais vazadas.
3. **`dependency_check`**: Executa o `npm audit` em modo strict tanto no backend quanto no frontend.
4. **`test_and_quality`**: Instala dependências, roda todas as baterias de testes médicos e compila o bundle de produção do frontend (`dist/`).

---

## 🔒 Boas Práticas Estabelecidas

1. **Consultas SQL Parametrizadas**: Nunca concatenar strings em queries SQL. Sempre utilizar `$1, $2, ...` com o pool do `pg`.
2. **Segurança de Sessão e JWT**: Tokens gerados com HMAC-SHA256, segredos lidos de variáveis de ambiente (`process.env.JWT_SECRET`) e tempo de expiração balanceado (3 dias).
3. **Proteção LGPD**: Sanitização de logs sensíveis de pacientes via `logSanitizerMiddleware` e blind index HMAC-SHA256 para buscas.
