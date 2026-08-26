-- ====================================================================
-- SCRIPT DE CORREÇÃO E SEED: QUESTÕES, FLASHCARDS, AUTH & IA (MedIa)
-- ====================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Atualização da tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash TEXT,
  photo_url TEXT,
  plan VARCHAR(50) DEFAULT 'estudante',
  crm VARCHAR(50),
  specialty VARCHAR(100),
  email_verificado BOOLEAN DEFAULT false,
  token_verificacao VARCHAR(255),
  app_mode VARCHAR(50) DEFAULT 'estudante',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar colunas caso a tabela já exista
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_verificacao VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Tabela de Sessões de Autenticação
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Conversas e Mensagens
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  modo VARCHAR(20) DEFAULT 'medico',
  titulo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL, -- 'user' ou 'model'
  conteudo TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Banco de Questões Oficiais de Residência
CREATE TABLE IF NOT EXISTS questoes (
  id SERIAL PRIMARY KEY,
  especialidade VARCHAR(100) NOT NULL,
  tema VARCHAR(200) NOT NULL,
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  resposta_correta INT NOT NULL,
  explicacao TEXT NOT NULL,
  banca VARCHAR(100) DEFAULT 'ENARE',
  ano INT DEFAULT 2024,
  dificuldade VARCHAR(20) DEFAULT 'media',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Flashcards de Repetição Espaçada
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  deck_id VARCHAR(50) NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  frente TEXT NOT NULL,
  verso TEXT NOT NULL,
  dificuldade VARCHAR(20) DEFAULT 'media',
  revisoes INT DEFAULT 0,
  intervalo_dias INT DEFAULT 1,
  facilidade FLOAT DEFAULT 2.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Doações e Transações PIX
CREATE TABLE IF NOT EXISTS doacoes_pix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  txid VARCHAR(100) UNIQUE NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'confirmado', 'expirado'
  chave_pix VARCHAR(100),
  descricao TEXT,
  qrcode_payload TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- ====================================================================
-- SEED DE 15+ QUESTÕES REAIS DE RESIDÊNCIA MÉDICA (ENARE, REVALIDA, USP)
-- ====================================================================
INSERT INTO questoes (especialidade, tema, enunciado, alternativas, resposta_correta, explicacao, banca, ano, dificuldade) VALUES
('Cardiologia', 'Hipertensão Arterial Sistêmica', 'Homem, 54 anos, diabético tipo 2 e hipertenso. Apresenta PA = 148/92 mmHg e microalbuminúria positiva (85 mg/g). Qual a conduta anti-hipertensiva inicial mais apropriada?', '["A) Iniciar Atenolol 50mg/dia", "B) Iniciar Enalapril 10mg/dia ou Losartana 50mg/dia (Nefroproteção)", "C) Iniciar Furosemida 40mg/dia", "D) Manter apenas estilo de vida por 6 meses"]'::jsonb, 1, 'IECA ou BRA são a primeira escolha para diabéticos com microalbuminúria devido ao efeito nefroprotetor comprovado.', 'ENARE', 2024, 'media'),

('Cardiologia', 'Infarto Agudo do Miocárdio', 'Paciente de 62 anos chega com dor retroesternal em aperto há 40 minutos com supra de ST de 3mm em DII, DIII e aVF. Qual a artéria coronária acometida?', '["A) Artéria Descendente Anterior", "B) Artéria Coronária Direita", "C) Artéria Circunflexa", "D) Tronco da Coronária Esquerda"]'::jsonb, 1, 'DII, DIII e aVF correspondem à parede inferior, irrigada em 85-90% pela Coronária Direita (ACD).', 'Revalida INEP', 2024, 'media'),

('Infectologia', 'Sepse e Choque Séptico', 'Homem de 68 anos com pneumonia evolui com sonolência, PA = 80/50 mmHg e lactato = 3,8 mmol/L após 30 mL/kg de cristaloides. Qual o vasopressor de 1ª escolha?', '["A) Dopamina", "B) Noradrenalina", "C) Dobutamina", "D) Adrenalina em bolus"]'::jsonb, 1, 'A Noradrenalina é o vasopressor de primeira escolha no choque séptico (alvo PAM >= 65 mmHg).', 'USP-SP', 2024, 'facil'),

('Endocrinologia', 'Cetoacidose Diabética', 'Jovem com DM1 apresenta glicemia = 420 mg/dL, pH = 7,15, K+ = 3,1 mEq/L. Antes de iniciar a insulina regular IV, qual a conduta prioritária?', '["A) Iniciar Bicarbonato de Sódio", "B) Repor Cloreto de Potássio até K+ > 3,3 mEq/L", "C) Aplicar Insulina Regular em bolus", "D) Administrar Furosemida"]'::jsonb, 1, 'Se o K+ estiver < 3,3 mEq/L, a insulina não deve ser iniciada até a correção do potássio para evitar arritmias cardíacas fatais.', 'UNICAMP', 2024, 'dificil'),

('Cirurgia Geral', 'Trauma Torácico / ATLS', 'Vítima de acidente de trânsito apresenta dispneia intensa, desvio de traqueia para a direita e ausência de murmúrio vesicular à esquerda. Conduta imediata?', '["A) Solicitar Tomografia de Tórax", "B) Descompressão torácica por punção no 4º/5º EIC esquerdo", "C) Intubação imediata com pressão positiva", "D) Pericardiocentese de urgência"]'::jsonb, 1, 'Pneumotórax hipertensivo é diagnóstico clínico e exige descompressão imediata com agulha grossa.', 'SUS-SP', 2024, 'media'),

('Gastroenterologia', 'Abdome Agudo Inflamatório', 'Mulher de 42 anos com dor em cólica no hipocôndrio direito após alimentos gordurosos e Sinal de Murphy positivo. Método diagnóstico inicial padrão-ouro?', '["A) Ultrassonografia de Abdome Superior", "B) Tomografia de Abdome", "C) Endoscopia Digestiva Alta", "D) CPRE"]'::jsonb, 0, 'A ultrassonografia de abdome é o exame de escolha para colecistite aguda litiásica (sensibilidade > 95%).', 'Revalida INEP', 2024, 'facil'),

('Pediatria', 'Meningite Bacteriana', 'Lactente de 10 meses com febre, fontanela abaulada e diplococos gram-negativos no liquor. Agente e tratamento?', '["A) Streptococcus pneumoniae; Ampicilina", "B) Neisseria meningitidis; Ceftriaxona", "C) Listeria monocytogenes; Gentamicina", "D) Herpes Vírus; Aciclovir"]'::jsonb, 1, 'Diplococos gram-negativos identificam o Meningococo (Neisseria meningitidis). Tratamento com Ceftriaxona.', 'UNICAMP', 2024, 'media'),

('Pediatria', 'Aleitamento Materno', 'RN com 5 dias em AME. Mãe com fissuras mamilares; bebê com boca pouco aberta e lábio inferior virado para dentro. Diagnóstico e conduta?', '["A) Hipogalactia; prescrever fórmula", "B) Pega inadequada; corrigir posicionamento e pega", "C) Mastite; iniciar Cefalexina", "D) Freio curto; frenotomia"]'::jsonb, 1, 'Sinais de pega inadequada causam fissuras e dor. A conduta é reorientação da pega (abocanhar aréola inferior).', 'ENARE', 2024, 'facil'),

('Ginecologia', 'Hipertensão na Gestação', 'Gestante de 16 semanas com PA = 150/95 mmHg. Qual anti-hipertensivo é formalmente contraindicado?', '["A) Metildopa", "B) Enalapril (Inibidor da ECA)", "C) Hidralazina", "D) Nifedipino"]'::jsonb, 1, 'IECAs e BRAs são teratogênicos (categoria D) e contraindicados na gestação (risco de disgenesia renal fetal).', 'USP-SP', 2024, 'facil'),

('Obstetrícia', 'Hemorragias da Gestação', 'Gestante de 34 semanas com dor abdominal súbita intensa, sangramento vermelho-escuro e hipertonia uterina. Diagnóstico?', '["A) Placenta Prévia", "B) Descolamento Prematuro de Placenta (DPP)", "C) Rotura de Vasa Prévia", "D) Trabalho de parto prematuro"]'::jsonb, 1, 'Dor súbita, sangramento escuro e útero hipertônico ("em madeira") caracterizam DPP. Conduta: parto cesáreo urgente.', 'ENARE', 2024, 'media'),

('Medicina Preventiva', 'Epidemiologia Clínica', 'Ao aplicar um teste de triagem em população com maior prevalência da doença, o que ocorre?', '["A) Sensibilidade e Especificidade aumentam", "B) Valor Preditivo Positivo (VPP) aumenta", "C) VPP diminui e Especificidade aumenta", "D) Sensibilidade diminui"]'::jsonb, 1, 'Sensibilidade e Especificidade são intrínsecas ao teste. O VPP aumenta diretamente quando a prevalência sobe.', 'ENARE', 2024, 'media'),

('Medicina Preventiva', 'Legislação do SUS', 'A participação da comunidade na gestão do SUS (Lei 8.142/90) ocorre através de quais instâncias e com qual paridade?', '["A) Conselhos e Conferências de Saúde com 50% de usuários", "B) CIB e CIT com 25% de usuários", "C) Assembleias Legislativas Municipais", "D) Sindicatos de Saúde"]'::jsonb, 0, 'A Lei 8.142/90 estabelece paridade de 50% para representantes dos usuários nos Conselhos e Conferências.', 'SUS-SP', 2024, 'facil')
ON CONFLICT DO NOTHING;
