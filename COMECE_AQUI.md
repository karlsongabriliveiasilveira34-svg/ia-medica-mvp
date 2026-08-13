# 🎯 COMECE AQUI - IA Clínica RAG

## ✨ O que você recebeu?

Um **sistema RAG completo de IA Médica** pronto para usar! 

```
📚 Documentos Médicos (PDFs)
        ↓
    [Ingeste]
        ↓
   Chunks + Embeddings
        ↓
  PostgreSQL + pgvector
        ↓
   Busca Vetorial (Semântica)
        ↓
   Google Gemini (IA)
        ↓
   Resposta Contextualizada
```

## 🚀 Quick Start (5 minutos)

### 1. **Configure a Chave Gemini** (1 min)
```bash
# Acesse: https://aistudio.google.com
# Clique em "Get API Key"
# Copie a chave gerada
```

### 2. **Edite o .env** (1 min)
```bash
cd ia-clinica-rag
nano .env  # ou abra em seu editor
```

Cole sua chave:
```
GEMINI_API_KEY=sua_chave_aqui
```

### 3. **Inicie com Docker** (2 min)
```bash
docker-compose up -d
```

✅ **Pronto!** Servidor rodando em `http://localhost:3000`

### 4. **Ingira Documentos** (1 min)
```bash
# Coloque PDFs em:
# - knowledge/artigos/
# - knowledge/diretrizes/
# - knowledge/protocolos/

npm run ingest
```

## 🧪 Teste a API

### Verificar Saúde
```bash
curl http://localhost:3000/health
```

### Fazer Uma Pergunta
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Quais são os sintomas de infarto do miocárdio?",
    "topK": 5
  }'
```

Resultado:
```json
{
  "status": "success",
  "answer": "De acordo com os documentos médicos...",
  "relevantChunks": [
    {
      "document": "seu_pdf.pdf",
      "similarity": 0.89
    }
  ]
}
```

## 📁 Arquivos Importantes

```
ia-clinica-rag/
├── .env                  ← EDITE AQUI (sua chave Gemini)
├── docker-compose.yml    ← Já pronto para usar
├── README.md            ← Documentação completa
├── src/
│   ├── app.js           ← App Express
│   ├── server.js        ← Servidor
│   ├── services/        ← Lógica do RAG
│   └── routes/          ← Endpoints da API
└── knowledge/           ← Coloque PDFs aqui
    ├── artigos/
    ├── diretrizes/
    └── protocolos/
```

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Documentação completa e detalhada |
| `SETUP_GUIDE.md` | Guia passo a passo com troubleshooting |
| `RESUMO_IMPLEMENTACAO.md` | O que foi implementado |
| `POSTMAN_COLLECTION.json` | Para testar no Postman/Insomnia |

## 🤖 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status do servidor |
| GET | `/api` | Informações da API |
| **POST** | **`/api/query`** | 🎯 **Fazer pergunta médica** |
| GET | `/api/documents` | Listar documentos |
| DELETE | `/api/documents/:id` | Deletar documento |

## ⚙️ Variáveis de Ambiente

```env
# ESSENCIAL - Obter em https://aistudio.google.com
GEMINI_API_KEY=sua_chave_aqui

# Banco de dados (pronto, não mude)
DATABASE_URL=postgresql://clinica:clinica_dev@localhost:5432/clinica_rag

# Modelos Gemini (padrão funcionam bem)
GEMINI_MODEL=gemini-2.0-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

# Outros
PORT=3000
NODE_ENV=development
```

## 🐛 Problemas Comuns

### ❌ "GEMINI_API_KEY não encontrado"
```bash
# Verifique o .env
cat .env | grep GEMINI_API_KEY

# Se vazio, refaça o passo 1 do Quick Start
```

### ❌ "Erro de conexão com PostgreSQL"
```bash
# Reinicie os containers
docker-compose restart
```

### ❌ "Nenhum documento foi encontrado"
```bash
# Verifique se PDFs estão em knowledge/
ls -la knowledge/artigos/
ls -la knowledge/diretrizes/
ls -la knowledge/protocolos/

# Se vazio, coloque PDFs lá e rode:
npm run ingest
```

### ❌ "Porta 3000 já em uso"
```bash
# Mude em .env:
PORT=3001
```

## 💡 Dicas de Uso

1. **Primeiros Testes**: Use perguntas simples
   ```
   ❌ "Me explicar tudo sobre cardiologia"
   ✅ "Quais são os sintomas de infarto?"
   ```

2. **Mais Contexto**: Aumentar `topK`
   ```json
   {"question": "...", "topK": 10}
   ```

3. **Resultados Específicos**: Aumentar `minSimilarity`
   ```json
   {"question": "...", "minSimilarity": 0.7}
   ```

4. **Mais Documentos**: Adicione PDFs e rode `npm run ingest`

## 🚢 Próximas Etapas

- [ ] Adicionar documentos médicos em `knowledge/`
- [ ] Testar queries no Postman/Insomnia
- [ ] Implementar autenticação (JWT)
- [ ] Fazer deploy em produção
- [ ] Monitorar uso da API Gemini

## 🔗 Links Úteis

- [Google Gemini API](https://ai.google.dev)
- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)
- [Express.js Docs](https://expressjs.com)
- [Docker Docs](https://docs.docker.com)

## 💬 Precisa de Ajuda?

1. Leia `SETUP_GUIDE.md` (troubleshooting detalhado)
2. Cheque `README.md` (documentação completa)
3. Importe `POSTMAN_COLLECTION.json` e teste os endpoints

## ✅ Checklist Rápido

- [ ] Clonei o projeto
- [ ] Configurei `.env` com `GEMINI_API_KEY`
- [ ] Rodei `docker-compose up -d`
- [ ] Coloquei PDFs em `knowledge/`
- [ ] Rodei `npm run ingest`
- [ ] Testei `curl http://localhost:3000/health`
- [ ] Fiz uma query em `/api/query`

---

## 🎉 Pronto?

```bash
# Execute tudo de uma vez:
cd ia-clinica-rag
nano .env  # Configure sua chave Gemini
docker-compose up -d
npm run ingest
curl http://localhost:3000/health
```

**Você está pronto para usar IA Médica!** 🏥🤖

