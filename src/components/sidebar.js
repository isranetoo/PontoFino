"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { ROLE_CONFIG } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import {
  BarChart3,
  Home,
  Users,
  RefreshCw,
  Calculator,
  Calendar,
  Target,
  FolderOpen,
  ShieldCheck,
  Bell,
  FileText,
  Wallet,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/suitability", label: "Suitability", icon: ShieldCheck },
  { href: "/rebalance", label: "Rebalanceamento", icon: RefreshCw },
  { href: "/simulator", label: "Simulador", icon: Calculator },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/commissions", label: "Comissões", icon: Wallet },
];

const ADMIN_ITEM = { href: "/admin", label: "Admin", icon: Shield };

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();

  const navItems =
    profile?.role === "admin" ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]",
          collapsed && "justify-center"
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
          <BarChart3 size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Rebalanceador
            </p>
            <p className="text-[9px] text-white/30">Plataforma v1.0</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border",
                active
                  ? "bg-indigo-500/15 text-white border-indigo-500/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border-transparent",
                collapsed && "justify-center"
              )}
              title={item.label}
            >
              <item.icon
                size={17}
                className={active ? "text-indigo-400" : ""}
              />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className={cn(
          "px-3 py-4 border-t border-white/[0.06]",
          collapsed && "text-center"
        )}
      >
        {!collapsed && profile && (
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/50">
              {getInitials(profile.full_name || "U")}
            </div>
            <div>
              <p className="text-xs font-medium text-white/70">
                {profile.full_name}
              </p>
              <p className="text-[9px] text-white/30">
                {ROLE_CONFIG[profile.role]?.label}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={14} />
          {!collapsed && "Sair"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-white/[0.06] bg-slate-950/50 backdrop-blur-xl transition-all duration-300 flex-shrink-0 relative",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-slate-700 transition-all z-50"
        >
          {collapsed ? (
            <ChevronRight size={12} />
          ) : (
            <ChevronLeft size={12} />
          )}
        </button>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-4 py-3">
        <button onClick={() => setMobileOpen(true)} className="p-1">
          <Menu size={20} className="text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <BarChart3 size={14} />
          </div>
          <span className="text-sm font-semibold">Rebalanceador</span>
        </div>
        <div className="w-7" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100] animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] bg-slate-950 border-r border-white/[0.06] animate-fade-in-up">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
