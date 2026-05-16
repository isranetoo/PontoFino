"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { visualStatus } from "@/lib/invoices";
import { Spinner } from "@/components/ui";

const STATUS_LABEL = {
  pendente:  "Pendente",
  vencida:   "Vencida",
  paga:      "Paga",
  cancelada: "Cancelada",
};

export default function InvoicePrintPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const id = params?.id;

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;

      const [{ data: inv }, { data: it }, { data: userData }] = await Promise.all([
        supabase
          .from("invoices")
          .select("*, clients(full_name, email, phone, document)")
          .eq("id", id)
          .single(),
        supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", id)
          .order("created_at", { ascending: true }),
        supabase.auth.getUser(),
      ]);

      if (!inv) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      let profile = null;
      if (userData?.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", userData.user.id)
          .single();
        profile = p;
      }

      setInvoice(inv);
      setItems(it || []);
      setConsultant(profile);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  // Auto-trigger print dialog once content is ready
  useEffect(() => {
    if (!loading && invoice) {
      const t = setTimeout(() => {
        try { window.print(); } catch {}
      }, 350);
      return () => clearTimeout(t);
    }
  }, [loading, invoice]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <Spinner size={28} />
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <p className="text-sm">Fatura não encontrada.</p>
      </div>
    );
  }

  const status = visualStatus(invoice);

  return (
    <>
      {/* Print-specific styling — overrides the dark app theme */}
      <style jsx global>{`
        @page { size: A4; margin: 18mm 16mm; }
        body { background: white !important; color: #111 !important; }
        body > div.fixed { display: none !important; }
        .invoice-page { color: #111; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="invoice-page min-h-screen bg-white text-black p-8 max-w-3xl mx-auto font-sans">
        {/* Top action — hidden on print */}
        <div className="no-print mb-6 flex items-center justify-between">
          <a href="/faturamento" className="text-xs text-indigo-700 underline">← Voltar para faturamento</a>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            Imprimir / Salvar como PDF
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-gray-200">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Fatura</p>
            <p className="text-3xl font-bold font-mono text-gray-900 mt-1">{invoice.number}</p>
            <p className="text-xs text-gray-500 mt-1">
              Status: <span className="font-semibold text-gray-700">{STATUS_LABEL[status]}</span>
            </p>
          </div>
          <div className="text-right">
            {consultant && (
              <>
                <p className="text-sm font-semibold text-gray-900">{consultant.full_name || "—"}</p>
                {consultant.email && <p className="text-xs text-gray-600">{consultant.email}</p>}
                {consultant.phone && <p className="text-xs text-gray-600">{consultant.phone}</p>}
              </>
            )}
          </div>
        </div>

        {/* Parties + dates */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Cobrado de</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.clients?.full_name || "—"}</p>
            {invoice.clients?.document && <p className="text-xs text-gray-600">{invoice.clients.document}</p>}
            {invoice.clients?.email && <p className="text-xs text-gray-600">{invoice.clients.email}</p>}
            {invoice.clients?.phone && <p className="text-xs text-gray-600">{invoice.clients.phone}</p>}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Emissão</p>
              <p className="text-sm font-semibold text-gray-900">{new Date(`${invoice.issued_at}T00:00:00`).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Vencimento</p>
              <p className="text-sm font-semibold text-gray-900">{new Date(`${invoice.due_at}T00:00:00`).toLocaleDateString("pt-BR")}</p>
            </div>
            {invoice.paid_at && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Pago em</p>
                <p className="text-sm font-semibold text-emerald-700">{new Date(`${invoice.paid_at}T00:00:00`).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 text-left">
                <th className="py-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Descrição</th>
                <th className="py-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold text-right w-32">Valor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-gray-100">
                  <td className="py-2 text-gray-800">{it.description}</td>
                  <td className="py-2 text-right font-mono text-gray-900">{formatCurrency(Number(it.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            {Number(invoice.tax_amount) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Imposto ({Number(invoice.tax_pct)}%)</span>
                <span className="font-mono">{formatCurrency(Number(invoice.tax_amount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 mt-2 border-t-2 border-gray-300 text-base">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(Number(invoice.total))}</span>
            </div>
          </div>
        </div>

        {/* Payment + notes */}
        {(invoice.payment_method || invoice.notes) && (
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            {invoice.payment_method && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Forma de pagamento</p>
                <p className="text-sm text-gray-800">{invoice.payment_method}</p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Observações</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-[10px] text-gray-400 text-center">
          Fatura gerada em {new Date(invoice.created_at).toLocaleString("pt-BR")}
        </div>
      </div>
    </>
  );
}
