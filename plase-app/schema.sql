-- PLASE Annotation System — Schema PostgreSQL
-- Executar via psql antes do primeiro deploy

CREATE TABLE IF NOT EXISTS responses (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT now(),

  -- Dados demográficos
  language              TEXT NOT NULL,
  age                   INTEGER NOT NULL,
  sex                   TEXT NOT NULL,
  nationality           TEXT NOT NULL,
  location              TEXT NOT NULL,

  -- Respostas D1-D6
  d1                    TEXT NOT NULL,
  d2                    TEXT NOT NULL,
  d3                    TEXT NOT NULL,
  d4                    TEXT NOT NULL,
  d5                    TEXT NOT NULL,
  d6_scale              INTEGER NOT NULL CHECK (d6_scale BETWEEN 1 AND 5),
  d6_text               TEXT,

  -- Análise PLASE gerada pelo Claude (JSON com 3 opções por dimensão)
  plase_options         JSONB,
  plase_analyzed_at     TIMESTAMPTZ,

  -- Anotação clínica da Dr. De Clara
  annotation_status     TEXT DEFAULT 'pending', -- pending | annotated | exported
  annotated_at          TIMESTAMPTZ,
  annotator_notes       TEXT,

  -- Vetor final anotado
  final_V               REAL,
  final_A               REAL,
  final_R               REAL,
  final_T               REAL,
  final_phi_elab        REAL,
  final_phi_comport     REAL,
  final_delta           REAL,
  final_window          TEXT,
  final_stadio          TEXT,

  -- Metadados de seleção (A/B/C ou manual)
  selections            JSONB -- {D1: {V: 'A', A: 'B', ...}, D2: {...}, ...}
);

CREATE INDEX IF NOT EXISTS responses_created_at_idx ON responses (created_at DESC);
CREATE INDEX IF NOT EXISTS responses_status_idx ON responses (annotation_status);

-- Tabela de sessão admin
CREATE TABLE IF NOT EXISTS admin_sessions (
  token     TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);
