"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/sidebar";
import { Spinner } from "@/components/ui";

export default function PlatformLayout({ children }) {
  const { loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto mt-[52px] md:mt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          {children}
        </div>
      </main>
    </div>
  );
}
