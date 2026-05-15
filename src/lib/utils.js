import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format BRL currency */
export function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Format percentage from decimal (0.20 → "20.0%") */
export function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

/** Get initials from full name */
export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Generate a random password */
export function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

/** Password strength checker */
export function checkPasswordStrength(password) {
  const checks = [
    { label: "8+ caracteres", pass: password.length >= 8 },
    { label: "Letra maiúscula", pass: /[A-Z]/.test(password) },
    { label: "Número", pass: /\d/.test(password) },
    { label: "Caractere especial", pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  return { checks, score, isValid: score >= 3 && password.length >= 8 };
}
