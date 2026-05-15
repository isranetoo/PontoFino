import "./globals.css";

export const metadata = {
  title: "Rebalanceador | Plataforma de Consultoria",
  description:
    "Plataforma de rebalanceamento de carteiras para consultores de investimentos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-950 text-white">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
