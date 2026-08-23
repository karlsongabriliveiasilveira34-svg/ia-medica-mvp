# DOSSIÊ TÉCNICO E DE NEGÓCIOS
## PLATAFORMA DE INTELIGÊNCIA CLÍNICA & ECOSSISTEMA HOSPITALAR (medIa)

**Versão:** 1.0  
**Autor:** Karlson Gabriel & Equipe  
**Local:** Montes Claros / MG — 2026  
**Status:** Validação de Mercado / Arquitetura do Sistema  

---

## MÓDULO 1: VISÃO GERAL, FLUXOS DE DADOS E ENGENHARIA DE NEGÓCIO

### 1.1. Propósito e Proposta de Valor
A plataforma **medIa** foi concebida para atuar como um **Ecossistema Unificado de Suporte à Decisão Clínica e Gestão da Jornada do Paciente**. O diferencial central não é ser um simples ERP hospitalar ou uma IA conversacional isolada, mas sim a integração *End-to-End*:

1. **Jornada do Paciente:** Captura de sintomas via anamnese prévia no agendamento em casa.
2. **Processamento Antecipado (Backend RAG):** Construção da ficha sintética antes da consulta.
3. **Ponto de Cuidado (Copiloto Médico):** Interface com diagnósticos diferenciais ordenados por probabilidade e literatura científica integrada (sem necessidade de consultar sistemas externos como UpToDate).
4. **Capacitação Médica:** Módulo de estudo para estudantes de medicina, aproveitando a mesma inteligência do RAG.

---

### 1.2. Módulos e Engenharia de Multi-Tenancy (Perfis)

```
                       ┌───────────────────────────────────────┐
                       │     SISTEMA CENTRAL (Node.js/Express)  │
                       └───────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────▼────────┐               ┌────────▼────────┐               ┌────────▼────────┐
│ MÓDULO ESTUDANTE │               │ MÓDULO MÉDICO   │               │ MÓDULO CLÍNICA  │
├─────────────────┤               ├─────────────────┤               ├─────────────────┤
│ • IA Conversac. │               │ • Fila do Dia   │               │ • Agendamento   │
│ • Casos Clínic. │               │ • Prontuário    │               │ • Anamnese Pré. │
│ • Busca RAG     │               │ • Diagnósticos  │               │ • Gestão de IP  │
│ • Cota Diária   │               │ • Evidências    │               │ • Webhooks ERP  │
└─────────────────┘               └─────────────────┘               └─────────────────┘
```

#### A. Modo Estudante
- **Objetivo:** Ferramenta de apoio pedagógico para graduação e residência médica.
- **Funcionalidades:** Treinamento com casos clínicos fictícios, simulação de diagnósticos diferenciais, fisiopatologia didática e busca direta no acervo de literatura médica indexada.
- **Modelo Monetário:** Assinaturas recorrentes B2C (mensal/anual) com limitação de tokens/requests por meio de middleware no Express acoplado ao Redis.

#### B. Modo Médico / Profissional
- **Objetivo:** Otimização do tempo de consulta, redução da sobrecarga cognitiva e precisão diagnóstica.
- **Funcionalidades:** Painel integrado exibindo o resumo sintético da anamnese prévia enviada pelo paciente, sugestões de exames complementares, diagnóstico diferencial ranqueado (cálculo probabilístico 100%) e links diretos para os artigos/diretrizes oficiais de suporte.
- **Segurança:** A IA atua estritamente como ferramenta de apoio (*Decisão Clínica Auxiliada*); a assinatura e responsabilidade diagnóstica permanecem com o médico (CRM).

#### C. Modo Clínica / Hospitalar (Admin B2B)
- **Objetivo:** Gestão da recepção, agendamentos e recepção da anamnese prévia.
- **Funcionalidades:** Liberação de agendas, controle de permissões por perfil (RBAC), envio automático de links de agendamento via WhatsApp/SMS e integração via APIs/Webhooks com sistemas hospitalares legados.

---

### 1.3. Detalhamento do Fluxo de Dados End-to-End

```
[Paciente] ──(1. Agendamento + Sintomas)──> [Frontend Web]
                                                   │
                                            (2. Requisita)
                                                   │
                                                   ▼
[PostgreSQL/pgvector] <──(3. RAG/Artigos)─── [API Express] ───(4. Fila Assíncrona)───> [Redis / BullMQ]
                                                   │                                          │
                                           (6. Ficha Pronta)                                  │ (5. Envia Prompt)
                                                   │                                          │
                                                   ▼                                          ▼
[Médico no Hospital] <────(7. Exibe Ficha + Evidências)───────────────────────────── [Google Gemini API]
```

1. **Agendamento & Anamnese:** O paciente agenda a consulta e preenche uma lista guiada de sintomas e histórico básico em linguagem natural.
2. **Consentimento LGPD:** O aceite expresso do Termo de Consentimento para Tratamento de Dados Sensíveis de Saúde (Art. 11 da LGPD) é registrado no banco com timestamp UTC, IP e Hash.
3. **Processamento em Fila (BullMQ + Redis):** A requisição é enfileirada para não travar a resposta do usuário. O worker processa os sintomas e gera vetores (embeddings).
4. **Busca Vetorial (RAG no pgvector):** O sistema recupera no banco vetorial os artigos científicos, diretrizes do Ministério da Saúde e guidelines pertinentes.
5. **Enriquecimento do Contexto (Prompt Engineering):** O contexto recuperado + sintomas do paciente são estruturados e enviados à API do Gemini.
6. **Sintetização e Armazenamento:** O Gemini retorna um JSON estruturado com os diagnósticos prováveis, exames sugeridos e referências dos artigos.
7. **Exibição no Ponto de Cuidado:** Ao abrir a ficha do paciente, o médico recebe tudo pronto e validado, economizando até 60% do tempo de digitação inicial.

---

### 1.4. Planejamento Estratégico: Transição do Privado para o Setor Público (SUS)
- **Fase 1 (SaaS Privado):** Lançamento dos módulos de Estudante e Clínicas Privadas para validação técnica e fluxo de caixa.
- **Fase 2 (Módulo de Pediatria Especializada):** Desenvolvimento de calculadoras de doses por peso corporal (mg/kg/dia), curvas de crescimento OMS (escore-z), alertas de vacinação e protocolos de triagem pediátrica.
- **Fase 3 (Licitações / Parcerias Públicas):** Submissão do sistema para prefeituras e secretarias de saúde como solução para amenizar a escassez de médicos especialistas, fornecendo ao clínico geral do SUS uma ferramenta com inteligência especializada no atendimento infantil.

---

## MÓDULO 2: ENGENHARIA DE BANCO DE DADOS E ARQUITETURA DE BACKEND

### 2.1. Modelagem Relacional e Vetorial (PostgreSQL + pgvector)

#### A. Tabela de Usuários e Autenticação (`users`)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('estudante', 'medico', 'admin_clinica')),
    crm VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### B. Tabela de Planos e Cotas (`subscriptions`)
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'estudante_pro', 'medico_individual', 'clinica_b2b')),
    daily_request_limit INTEGER DEFAULT 50,
    status VARCHAR(50) DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### C. Tabela do Acervo Científico e Embeddings (`medical_knowledge`)
```sql
CREATE TABLE medical_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    content_chunk TEXT NOT NULL,
    embedding VECTOR(768) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.2. Fluxo da Fila Assíncrona (Node.js + BullMQ + Redis)
```
[Requisição HTTP] ──> [Controller Express] ──> [Adiciona Job no BullMQ] ──> [Resposta 202 Accepted]
                                                        │
                                                        ▼
                                             [Worker em Segundo Plano]
                                                        │
                                       ┌────────────────┴────────────────┐
                                       ▼                                 ▼
                          [Consulta Embeddings/RAG]            [Chamada API Gemini]
                                       │                                 │
                                       └────────────────┬────────────────┘
                                                        │
                                                        ▼
                                           [Salva Resultado no Postgres]
```

---

### 2.3. Payload de Resposta da IA para o Prontuário Médico
```json
{
  "resumo_anamnese": "Paciente do sexo feminino, 28 anos, apresentando febre alta contínua há 3 dias acompanhada de artralgia severa e mialgia.",
  "hipoteses_diagnosticas": [
    {
      "doenca": "Dengue",
      "probabilidade": "Alta",
      "justificativa": "Presença de febre súbita, mialgia intensa e exantema associados ao contexto epidemiológico."
    },
    {
      "doenca": "Chikungunya",
      "probabilidade": "Média",
      "justificativa": "Comprometimento articular acentuado (artralgia) bilateral."
    }
  ],
  "exames_sugeridos": [
    "Hemograma completo com contagem de plaquetas",
    "NS1 para Dengue (Primeiros 5 dias)",
    "Sorologia IgM/IgG"
  ],
  "evidencias_cientificas": [
    {
      "titulo": "Diretrizes Nacionais para Prevenção e Controle de Epidemias de Dengue",
      "fonte": "Ministério da Saúde",
      "trecho_relevante": "Em casos de suspeita de arboviroses, a prova do laço e a monitorização de plaquetas são obrigatórias na triagem inicial."
    }
  ]
}
```

---

## MÓDULO 3: SEGURANÇA, CONFORMIDADE COM A LGPD E ASPECTOS JURÍDICOS

### 3.1. Bases Legais e Gestão de Consentimento
- **Artigo 11, I da LGPD (Consentimento Expresso e Destacado):** Coleta de aceite em checkbox isolado no agendamento prévio.
- **Artigo 11, II, "f" da LGPD (Tutela da Saúde):** Processamento no âmbito do atendimento presencial por profissionais habilitados.
- **Trilha de Auditoria (Audit Log):** Registro em banco de timestamp UTC, IP, User-Agent e Hash do texto da política de privacidade.

### 3.2. Arquitetura de Segurança de Dados e Criptografia
- **Criptografia em Trânsito (TLS 1.3):** Comunicação integralmente segura em HTTPS.
- **Criptografia em Repouso (AES-256-GCM):** Proteção de identificadores pessoais (Nome, CPF, Telefone).
- **Anonimização no Pipeline de IA (RAG):** Remoção de dados PII/PHI no Node.js antes de acionar a API do Gemini.

### 3.3. Responsabilidade Médica e Ética (Resoluções CFM)
- **Resolução CFM nº 2.314/2022:** Soberania da decisão médica humana. A IA é exclusivamente copiloto/auxiliar; diagnóstico e conduta são de responsabilidade do médico (CRM).

---

## MÓDULO 4: PLANO ESTRATÉGICO PARA ATENDIMENTO INFANTIL E LICITAÇÕES (SUS)

### 4.1. Módulo Especializado em Pediatria

| Recurso Técnico | Descrição e Funcionalidade no Atendimento |
| :--- | :--- |
| **Calculadora Automática de Doses** | Cálculo de posologia (mg/kg/dia) com base no peso atual da criança, prevenindo erros posológicos. |
| **Curvas de Crescimento OMS** | Plotagem de Peso/Idade, Estatura/Idade e IMC/Idade em gráficos de escore-z (SBP/OMS). |
| **Caderneta de Vacinação Digital** | Checagem com o Calendário Nacional de Vacinação do SUS, alertando sobre atrasos. |
| **Triagem Pediátrica Específica** | Sinais de Alerta Red Flag (tiragem intercostal, tempo de enchimento capilar, prostração). |

### 4.2. Estratégia de Entrada em Vendas Públicas (Licitações)
- **Fase 1:** Consolidação SaaS Privado B2C/B2B.
- **Fase 2:** Projeto Piloto sem custos em Hospital Universitário (Unimontes/HU) ou UBS locais.
- **Fase 3:** Participação em Pregão Eletrônico (Lei 14.133/2021) com Atestado de Capacidade Técnica (ACT).

---

## MÓDULO 5: ENGENHARIA DE PROMPT E PIPELINE DE RAG MÉDICO

### 5.1. System Prompt Estruturado
- Regras de Groundedness estrito: sem alucinações.
- Todas as hipóteses justificadas com base nos fragmentos de literatura contidos no bloco de contexto.
- Ordenação por probabilidade decrescente e severidade.
- Saída estritamente em JSON válido.

### 5.2. Busca Semântica no pgvector
```sql
SELECT title, source, content_chunk, 1 - (embedding <=> $1) AS similarity
FROM medical_knowledge
WHERE 1 - (embedding <=> $1) > 0.78
ORDER BY similarity DESC LIMIT 5;
```

---

## MÓDULO 6: ROADMAP DE DESENVOLVIMENTO E CRONOGRAMA

| Fase / Período | Entregáveis Técnicos | Objetivo do Milestone |
| :--- | :--- | :--- |
| **Fase 1 (Sprints 1-2)** | Modelagem PostgreSQL + pgvector, Express JWT, Redis e cotas diárias. | Infraestrutura base e controle de planos finalizado. |
| **Fase 2 (Sprints 3-4)** | Pipeline RAG, ingestão de diretrizes e validação do Gemini sem alucinações. | Motor de raciocínio clínico testado. |
| **Fase 3 (Sprints 5-6)** | Frontend da Anamnese Prévia + Painel do Médico (Fila do Dia). | MVP completo de ponta a ponta. |
| **Fase 4 (Sprints 7-8)** | Módulo de Pediatria (Calculadora de doses, curvas OMS) e documentação de piloto. | Plataforma pronta para clínicas e hospitais. |

---

## MÓDULO 7: ARQUITETURA DE INTEGRAÇÃO COM ERPS HOSPITALARES (HL7 / FHIR)

- **Padronização HL7 FHIR:** Troca padronizada de recursos (`Patient`, `Encounter`, `Observation`).
- **Endpoint REST:** `/api/v1/fhir/Encounter`.
- **Fluxo de Webhooks:** Evento `agendamento-criado` $\rightarrow$ Disparo automático de WhatsApp/SMS com link da anamnese prévia $\rightarrow$ Paciente responde $\rightarrow$ IA sintetiza prontuário $\rightarrow$ Médico atende com a ficha pronta.

---

## MÓDULO 8: ESTRUTURA FINANCEIRA E MODELO DE PRICING

| Plano | Público-Alvo | Preço Sugerido | Recursos Incluídos |
| :--- | :--- | :--- | :--- |
| **Estudante Pro** | Alunos e Residentes | R$ 29,90 / mês | IA Conversacional, Casos Clínicos, Busca RAG e cota de 50 req/dia. |
| **Médico Individual** | Consultórios Próprios | R$ 189,00 / mês | Copiloto diagnóstico ilimitado, anamnese prévia e laudos médicos. |
| **Clínica / B2B** | Clínicas de Médio Porte | R$ 790,00 / mês | Até 5 médicos, agendamento online e painel de recepção. |
| **Hospital / SUS** | Redes e Prefeituras | Sob Consulta (Licitação) | Contrato anual, Módulo Pediátrico, suporte 24/7 e infraestrutura dedicada. |

---

## MÓDULO 9: VALIDAÇÃO ACADÊMICA E PARCERIAS
- Comitê de validação técnica com preceptores e professores (Unimontes/CCBS).
- Protocolo para submissão ao Comitê de Ética em Pesquisa (CEP/CONEP).
- Métricas de usabilidade (NPS e tempo de atendimento) com alunos do internato.

---

## MÓDULO 10: MATRIZ DE RISCOS OPERACIONAIS

| Risco Identificado | Impacto | Probabilidade | Estratégia de Mitigação |
| :--- | :--- | :--- | :--- |
| **Alucinação Diagnóstica** | Alto | Baixa | RAG com limiar $>0.78$ no pgvector + Termo de Responsabilidade do Médico. |
| **Vazamento de Dados (LGPD)** | Alto | Baixa | Criptografia AES-256-GCM, anonimização prévia no Node.js e logs de auditoria. |
| **Resistência Médica à Adoção** | Médio | Média | Interface hiper-enxuta, zero retrabalho de digitação e foco na anamnese prévia. |
| **Lentidão na IA** | Médio | Baixa | Filas Redis/BullMQ assíncronas geradas antes do médico abrir a consulta. |

---

## MÓDULO 11: GUIA PRÁTICO DE SETUP E INFRAESTRUTURA

```bash
# Banco PostgreSQL com pgvector
docker run -d --name postgres-vector -e POSTGRES_PASSWORD=secret -p 5432:5432 ankane/pgvector

# Fila Redis
docker run -d --name redis-bullmq -p 6379:6379 redis:alpine

# Dependências Backend
npm install express @google/genai pg pgvector bullmq ioredis jsonwebtoken bcrypt dotenv
```

---

## MÓDULO 12: GO-TO-MARKET REGIONAL
1. Parcerias com Ligas Acadêmicas de Medicina (CCBS/Unimontes/FASI).
2. Demonstração presencial em consultórios privados locais.
3. Apresentação executiva para gestores de clínicas e secretarias de saúde.

---

## MÓDULO 13: BOILERPLATE DO WORKER ASSÍNCRONO (Node.js + BullMQ)

```javascript
import { Worker } from 'bullmq';
import { GoogleGenAI } from '@google/genai';
import { Pool } from 'pg';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const anamneseWorker = new Worker('anamneseQueue', async (job) => {
  const { anamneseId, sintomasTexto } = job.data;

  // 1. Gera Embedding dos sintomas
  const embeddingResponse = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: sintomasTexto
  });
  const vector = embeddingResponse.embedding.values;

  // 2. Busca RAG no PostgreSQL
  const ragQuery = `
    SELECT title, source, content_chunk 
    FROM medical_knowledge 
    ORDER BY embedding <=> $1 LIMIT 3;
  `;
  const { rows: evidencias } = await pool.query(ragQuery, [JSON.stringify(vector)]);

  // 3. Monta o Prompt e chama o Gemini
  const prompt = `Analise os sintomas: "${sintomasTexto}". Contexto científico: ${JSON.stringify(evidencias)}`;
  const geminiResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  // 4. Salva o resultado estruturado no banco
  await pool.query(
    'UPDATE anamneses SET resultado_ia = $1, status = $2 WHERE id = $3',
    [geminiResponse.text, 'concluido', anamneseId]
  );
}, { connection: { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 } });
```

---

## MÓDULO 14: SÍNTESE DO DOSSIÊ E DIRETRIZES FINAIS

O ecossistema **medIa** combina rigor científico, arquitetura assíncrona escalável, blindagem jurídica (LGPD e CFM) e modelo financeiro de rápida tração. O roadmap segue estruturado para validar receita e tecnologia no setor privado enquanto constrói a musculatura técnica para a entrada em grande escala no setor público (SUS).
