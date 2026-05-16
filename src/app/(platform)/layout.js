"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/sidebar";
import { Spinner } from "@/components/ui";

export default function PlatformLayout({ children }) {
  const { loading, initialize } = useAuthStore();
  const pathname = usePathname();

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

  // Print routes render without sidebar/chrome so the printable
  // layout fills the page cleanly.
  const isChromeless = pathname?.includes("/print/");
  if (isChromeless) {
    return <>{children}</>;
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
