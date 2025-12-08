"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, ShoppingBag, User2 } from "lucide-react";
import { SiShopee } from "react-icons/si";

const ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#12E439_0%,#D8DE12_100%)]";

export default function AplicativoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col">
      {/* Conteúdo das páginas internas */}
      <main className="flex-1 px-4 pt-4 pb-20 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav fixo – estilizado com ícones */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 
          border-t border-white/8 
          bg-[#050505]/95 backdrop-blur
          px-4 py-2
        "
      >
        <div className="flex max-w-md mx-auto gap-2">
          <NavItem
            href="/aplicativo"
            label="Início"
            active={isActive("/aplicativo")}
            icon={<Home className="w-4 h-4" />}
          />

          <NavItem
            href="/aplicativo/ranking"
            label="Ranking"
            active={isActive("/aplicativo/ranking")}
            icon={<Trophy className="w-4 h-4" />}
          />

          <NavItem
            href="/aplicativo/shopeee"
            label="Shopeee"
            active={isActive("/aplicativo/shopeee")}
            // Ícone Shopee com react-icons
            icon={<SiShopee className="w-4 h-4" />}
          />

          <NavItem
            href="/aplicativo/perfil"
            label="Perfil"
            active={isActive("/aplicativo/perfil")}
            icon={<User2 className="w-4 h-4" />}
          />
        </div>
      </nav>
    </div>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
};

function NavItem({ href, label, active, icon }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center gap-0.5 text-[11px]"
    >
      <span
        className={`
          inline-flex items-center justify-center
          w-9 h-9 rounded-full
          ${active
            ? `${ACCENT_GRADIENT} text-[#0C0C0C] shadow-[0_10px_25px_rgba(34,197,94,0.45)]`
            : "bg-white/5 text-[#A1A1AA]"
          }
          transition-all duration-150
        `}
      >
        {icon}
      </span>
      <span
        className={`
          ${active ? "text-white font-medium" : "text-[#6B7280]"}
          transition-colors duration-150
        `}
      >
        {label}
      </span>
    </Link>
  );
}
