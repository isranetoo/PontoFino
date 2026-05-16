// ============================================================
// Suitability — banco de perguntas, score, perfil e match com carteira
// Estilo CVM/ANBIMA. Pesos somam 100 quando todas as respostas
// máximas são selecionadas; thresholds mapeiam para 5 perfis.
// ============================================================

export const SUITABILITY_QUESTIONS = [
  {
    id: "age",
    text: "Qual é a sua faixa etária?",
    options: [
      { label: "Acima de 65 anos", score: 0 },
      { label: "Entre 50 e 65 anos", score: 3 },
      { label: "Entre 35 e 50 anos", score: 6 },
      { label: "Entre 25 e 35 anos", score: 8 },
      { label: "Até 25 anos", score: 10 },
    ],
  },
  {
    id: "experience",
    text: "Há quanto tempo você investe?",
    options: [
      { label: "Nunca investi", score: 0 },
      { label: "Menos de 1 ano", score: 3 },
      { label: "Entre 1 e 3 anos", score: 6 },
      { label: "Entre 3 e 10 anos", score: 8 },
      { label: "Mais de 10 anos", score: 10 },
    ],
  },
  {
    id: "objective",
    text: "Qual é o seu principal objetivo ao investir?",
    options: [
      { label: "Preservar o patrimônio com máxima segurança", score: 0 },
      { label: "Gerar renda regular acima da inflação", score: 4 },
      { label: "Combinar renda e crescimento moderado", score: 6 },
      { label: "Crescimento de patrimônio no longo prazo", score: 8 },
      { label: "Maximizar ganhos, aceitando alta volatilidade", score: 10 },
    ],
  },
  {
    id: "horizon",
    text: "Por quanto tempo você pretende manter os investimentos?",
    options: [
      { label: "Posso precisar a qualquer momento", score: 0 },
      { label: "Até 1 ano", score: 3 },
      { label: "Entre 1 e 3 anos", score: 5 },
      { label: "Entre 3 e 5 anos", score: 8 },
      { label: "Mais de 5 anos", score: 10 },
    ],
  },
  {
    id: "knowledge",
    text: "Como você classifica seu conhecimento sobre investimentos?",
    options: [
      { label: "Nenhum — não conheço produtos financeiros", score: 0 },
      { label: "Básico — conheço poupança, CDB, Tesouro", score: 3 },
      { label: "Intermediário — entendo fundos, ações, FIIs", score: 6 },
      { label: "Avançado — opero derivativos e renda variável", score: 9 },
      { label: "Profissional — atuo no mercado financeiro", score: 10 },
    ],
  },
  {
    id: "income_share",
    text: "Quanto do seu patrimônio você pretende investir?",
    options: [
      { label: "Menos de 10%", score: 2 },
      { label: "Entre 10% e 25%", score: 4 },
      { label: "Entre 25% e 50%", score: 6 },
      { label: "Entre 50% e 75%", score: 8 },
      { label: "Mais de 75%", score: 10 },
    ],
  },
  {
    id: "reserve",
    text: "Você possui reserva de emergência (>= 6x despesas mensais)?",
    options: [
      { label: "Não tenho reserva", score: 0 },
      { label: "Menos de 3 meses", score: 2 },
      { label: "Entre 3 e 6 meses", score: 5 },
      { label: "Entre 6 e 12 meses", score: 8 },
      { label: "Mais de 12 meses", score: 10 },
    ],
  },
  {
    id: "loss_tolerance",
    text: "Qual a maior perda temporária que você aceitaria sem se desfazer dos investimentos?",
    options: [
      { label: "Não aceito perdas, nem temporárias", score: 0 },
      { label: "Até 5%", score: 3 },
      { label: "Até 15%", score: 6 },
      { label: "Até 30%", score: 8 },
      { label: "Acima de 30%", score: 10 },
    ],
  },
  {
    id: "reaction",
    text: "Se sua carteira caísse 20% em um mês, o que faria?",
    options: [
      { label: "Venderia tudo imediatamente", score: 0 },
      { label: "Venderia parte da posição", score: 3 },
      { label: "Manteria a posição", score: 6 },
      { label: "Aproveitaria pra aportar mais", score: 9 },
      { label: "Alavancaria a posição", score: 10 },
    ],
  },
  {
    id: "products",
    text: "Em quais produtos você já investiu?",
    options: [
      { label: "Apenas poupança", score: 0 },
      { label: "Renda fixa (CDB, Tesouro)", score: 3 },
      { label: "Fundos e FIIs", score: 6 },
      { label: "Ações e ETFs", score: 8 },
      { label: "Derivativos, cripto, internacional", score: 10 },
    ],
  },
];

// Soma máxima = 100 (10 perguntas × 10 pontos)
export const PROFILE_THRESHOLDS = [
  { max: 20, profile: "conservative" },
  { max: 40, profile: "moderate" },
  { max: 60, profile: "balanced" },
  { max: 80, profile: "growth" },
  { max: 100, profile: "aggressive" },
];

export const PROFILE_ORDER = ["conservative", "moderate", "balanced", "growth", "aggressive"];

// Score de risco por classe de ativo (0 = sem risco, 10 = altíssimo)
export const ASSET_CLASS_RISK = {
  caixa: 0,
  renda_fixa: 1,
  multimercado: 4,
  fiis: 5,
  acoes_brasil: 7,
  acoes_eua: 7,
  internacional: 7,
  commodities: 8,
  cripto: 10,
  outros: 5,
};

export function profileFromScore(score) {
  for (const t of PROFILE_THRESHOLDS) {
    if (score <= t.max) return t.profile;
  }
  return "aggressive";
}

export function calculateScore(answers) {
  // answers: { [questionId]: optionIndex }
  let total = 0;
  for (const q of SUITABILITY_QUESTIONS) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (opt) total += opt.score;
  }
  return total;
}

// Recebe alocação como { asset_class: weight } (weights somam 1).
// Retorna { score 0-10, profile }.
export function observedProfileFromAllocation(allocation) {
  let totalWeight = 0;
  let score = 0;
  for (const [klass, w] of Object.entries(allocation || {})) {
    const weight = Number(w) || 0;
    if (weight <= 0) continue;
    totalWeight += weight;
    score += (ASSET_CLASS_RISK[klass] ?? 5) * weight;
  }
  if (totalWeight === 0) return { score: 0, profile: "conservative" };
  const normalized = score / totalWeight;

  let profile;
  if (normalized <= 1.5) profile = "conservative";
  else if (normalized <= 3.5) profile = "moderate";
  else if (normalized <= 5.5) profile = "balanced";
  else if (normalized <= 7.5) profile = "growth";
  else profile = "aggressive";

  return { score: Math.round(normalized * 100) / 100, profile };
}

export function matchLevel(declared, observed) {
  const di = PROFILE_ORDER.indexOf(declared);
  const oi = PROFILE_ORDER.indexOf(observed);
  if (di < 0 || oi < 0) return "aligned";
  const diff = Math.abs(di - oi);
  if (diff === 0) return "aligned";
  if (diff === 1) return "mild";
  return "severe";
}

// Calcula data de expiração padrão (24 meses).
export function defaultExpirationDate(issuedAt = new Date()) {
  const d = new Date(issuedAt);
  d.setMonth(d.getMonth() + 24);
  return d.toISOString().slice(0, 10);
}
