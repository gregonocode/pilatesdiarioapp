// src/app/admin/dashboard/layout.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const ACCENT = "#12E439";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/dashboard/exercicios",
    label: "Exercícios",
    icon: Video,
  },
  {
    href: "/admin/dashboard/usuarios",
    label: "Usuárias",
    icon: Users,
  },
  {
    href: "/admin/dashboard/configuracoes",
    label: "Configurações",
    icon: Settings,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const supabase = supabaseBrowser();

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Opcional: mandar de volta pro login admin
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${ACCENT}20` }}
          >
            <span className="text-xs font-bold tracking-[0.18em] text-slate-900">
              PD
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              Pilates Diário
            </span>
            <span className="text-[11px] text-slate-500">
              Painel administrativo
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg
                  ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                <Icon
                  className="h-4 w-4"
                  style={active ? { color: "#ffffff" } : { color: "#475569" }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <p className="mt-2 text-[10px] text-slate-400 text-center">
            Acesso interno · use com cuidado
          </p>
        </div>
      </aside>

      {/* Conteúdo + topbar mobile */}
      <div className="flex-1 flex flex-col">
        {/* Topbar para mobile */}
        <header className="md:hidden px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${ACCENT}20` }}
            >
              <span className="text-[11px] font-bold tracking-[0.18em] text-slate-900">
                PD
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-900">
                Pilates Diário · Admin
              </span>
              <span className="text-[10px] text-slate-500">
                Área administrativa
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-4 md:py-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
