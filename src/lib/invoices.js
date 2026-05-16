// ============================================================
// Faturamento — geração de número, totais e status derivado.
// ============================================================

// Gera próximo número no formato YYYY/NNNN, sequencial por consultor.
// MVP: lê o último, soma 1. Tem race condition se duas faturas forem
// criadas simultaneamente — aceitável pra cargas baixas.
export async function nextInvoiceNumber(supabase, consultantId) {
  const year = new Date().getFullYear();
  const prefix = `${year}/`;

  const { data } = await supabase
    .from("invoices")
    .select("number")
    .eq("consultant_id", consultantId)
    .like("number", `${prefix}%`)
    .order("number", { ascending: false })
    .limit(1);

  let last = 0;
  if (data && data[0]) {
    const parts = data[0].number.split("/");
    last = parseInt(parts[1], 10) || 0;
  }
  const next = String(last + 1).padStart(4, "0");
  return `${prefix}${next}`;
}

export function computeTotals(items, taxPct) {
  const subtotal = (items || []).reduce((s, i) => s + Number(i.amount || 0), 0);
  const pct = Number(taxPct || 0);
  const taxAmount = Math.round(subtotal * pct) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: taxAmount,
    total,
  };
}

// Status visual: vencida quando status='pendente' e due_at < hoje
export function visualStatus(invoice) {
  if (!invoice) return "pendente";
  if (invoice.status !== "pendente") return invoice.status;
  const due = new Date(`${invoice.due_at}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today ? "vencida" : "pendente";
}

export function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
