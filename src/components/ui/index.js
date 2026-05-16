"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";

// ─── Glass Card ───
export function GlassCard({ children, className, delay = 0, ...props }) {
  return (
    <div
      className={cn(
        "bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl",
        className
      )}
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}s both` }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Glass Input ───
export function GlassInput({ icon: Icon, label, error, className, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex items-center rounded-xl border transition-all",
          error
            ? "border-red-500/40 bg-red-500/[0.03]"
            : focused
            ? "border-indigo-500/40 bg-white/[0.05]"
            : "border-white/10 bg-white/[0.03]",
          className
        )}
      >
        {Icon && (
          <Icon
            size={15}
            className={cn(
              "absolute left-3.5 transition-colors",
              focused ? "text-indigo-400" : "text-white/20"
            )}
          />
        )}
        <input
          className={cn(
            "w-full bg-transparent py-3 text-sm text-white placeholder:text-white/20 focus:outline-none",
            Icon ? "pl-10 pr-4" : "px-4"
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] text-red-400 ml-1 flex items-center gap-1 animate-fade-in">
          <AlertTriangle size={9} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Password Input ───
export function PasswordInput({ label, error, ...props }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex items-center rounded-xl border transition-all",
          error
            ? "border-red-500/40"
            : focused
            ? "border-indigo-500/40 bg-white/[0.05]"
            : "border-white/10 bg-white/[0.03]"
        )}
      >
        <Lock
          size={15}
          className={cn(
            "absolute left-3.5 transition-colors",
            focused ? "text-indigo-400" : "text-white/20"
          )}
        />
        <input
          type={show ? "text" : "password"}
          className="w-full bg-transparent py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/20 focus:outline-none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 text-white/20 hover:text-white/50 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-red-400 ml-1 flex items-center gap-1">
          <AlertTriangle size={9} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Password Strength ───
export function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ caracteres", pass: password.length >= 8 },
    { label: "Maiúscula", pass: /[A-Z]/.test(password) },
    { label: "Número", pass: /\d/.test(password) },
    { label: "Especial", pass: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500"];

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? colors[score - 1] : "bg-white/[0.05]"
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <span
            key={i}
            className={cn(
              "text-[9px] flex items-center gap-1",
              c.pass ? "text-emerald-400" : "text-white/20"
            )}
          >
            {c.pass ? "✓" : "✗"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ───
export function StatCard({ label, value, icon: Icon, trend, delay = 0 }) {
  return (
    <GlassCard className="p-4" delay={delay}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-white/35">
          {label}
        </span>
        <Icon size={14} className="text-white/20" />
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      {trend !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[10px]",
            trend >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {trend >= 0 ? (
            <ArrowUpRight size={10} />
          ) : (
            <ArrowDownRight size={10} />
          )}
          {Math.abs(trend)}% vs mês anterior
        </div>
      )}
    </GlassCard>
  );
}

// ─── Modal ───
const MODAL_SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({ children, onClose, title, icon: Icon, size = "md" }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${MODAL_SIZES[size] || MODAL_SIZES.md} bg-slate-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-in`}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {Icon && <Icon size={17} className="text-indigo-400" />}
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-white/30 hover:text-white/70 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Spinner ───
export function Spinner({ size = 20 }) {
  return (
    <div
      className="border-2 border-white/20 border-t-white rounded-full animate-spin-slow"
      style={{ width: size, height: size }}
    />
  );
}
