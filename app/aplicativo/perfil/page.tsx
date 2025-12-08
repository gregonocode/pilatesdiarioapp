"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { User2, LogOut, Mail, Award, Flame } from "lucide-react";

const ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#12E439_0%,#D8DE12_100%)]";

type Profile = {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  pontos: number;
  total_exercicios: number;
};

export default function PerfilPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        setEmail(user.email ?? null);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar profile:", error);
        } else {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error("Erro geral ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router, supabase]);

  function getInitials() {
    const nomeBase = profile?.nome || email || "";
    if (!nomeBase) return "?";
    const partes = nomeBase.trim().split(" ");
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setSigningOut(false);
    }
  }

  const pontos = profile?.pontos ?? 0;
  const totalExercicios = profile?.total_exercicios ?? 0;

  return (
    <div className="space-y-5 pb-4">
      {/* Header / avatar */}
      <section className="mt-1 flex items-center gap-4">
        <div
          className={`
            relative w-14 h-14 rounded-3xl overflow-hidden 
            border border-white/10 bg-[#050505]
            flex items-center justify-center
          `}
        >
          <div
            className={`
              absolute inset-[1px] rounded-3xl ${ACCENT_GRADIENT}
              opacity-60
            `}
          />
          <div className="relative z-10 w-full h-full rounded-3xl flex items-center justify-center bg-[#050505]/80">
            {profile?.avatar_url ? (
              // Se no futuro tiver avatar, só trocar por <Image />
              <span className="text-xs text-white">IMG</span>
            ) : (
              <span className="text-sm font-semibold text-white">
                {getInitials()}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase">
            Seu perfil
          </p>
          <h1 className="mt-1 text-lg font-bold text-white">
            {profile?.nome || "Pilates lover 💚"}
          </h1>
          {email && (
            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
              <Mail className="w-3 h-3" />
              <span>{email}</span>
            </div>
          )}
        </div>
      </section>

      {/* Card principal com verde clarinho */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-4 py-4 space-y-3
        "
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#A1A1AA] uppercase">
              Seu progresso
            </p>
            <p className="mt-1 text-sm text-[#E5E7EB]">
              Treinar um pouquinho todo dia vale mais do que treinar muito uma vez só.
            </p>
          </div>
          <div
            className="
              hidden xs:flex w-10 h-10 rounded-2xl 
              items-center justify-center 
              bg-white/5
            "
          >
            <User2 className="w-4 h-4 text-[#D4D4D8]" />
          </div>
        </div>

        {/* Bloco verde clarinho */}
        <div
          className="
            mt-2 rounded-2xl bg-[#D9FCE0] px-4 py-3 
            flex items-center justify-between gap-4
          "
        >
          <div>
            <p className="text-[11px] font-semibold text-[#14532D] uppercase tracking-[0.18em]">
              Pontuação atual
            </p>
            <p className="mt-1 text-base font-bold text-[#052E16]">
              {pontos} pontos
            </p>
            <p className="text-[11px] text-[#166534] mt-0.5">
              Cada treino concluído rende +25 pontos.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166534]">
              <Flame className="w-3 h-3" />
              {totalExercicios} treinos
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D]">
              <Award className="w-3 h-3" />
              {/* Placeholder de “nível” simples baseado nos pontos */}
              {pontos >= 500 ? "Nível 3 • Constante" : pontos >= 200 ? "Nível 2 • Firme" : "Nível 1 • Começando"}
            </span>
          </div>
        </div>
      </section>

      {/* Card de detalhes */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-4 py-4 space-y-3
        "
      >
        <h2 className="text-sm font-semibold text-white">
          Detalhes da conta
        </h2>
        <div className="space-y-2 text-[13px] text-[#D4D4D8]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#9CA3AF]">Nome</span>
            <span className="font-medium text-right">
              {profile?.nome || "Definir depois"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#9CA3AF]">E-mail</span>
            <span className="font-medium text-right truncate max-w-[60%]">
              {email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#9CA3AF]">Treinos concluídos</span>
            <span className="font-medium">{totalExercicios}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#9CA3AF]">Pontuação total</span>
            <span className="font-medium">{pontos}</span>
          </div>
        </div>
      </section>

      {/* Botão de sair */}
      <section className="pt-1">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut || loading}
          className={`
            w-full h-10 rounded-full border text-[13px] font-medium
            flex items-center justify-center gap-2
            ${
              signingOut || loading
                ? "border-white/10 text-[#9CA3AF]"
                : "border-white/20 text-[#E5E7EB] hover:border-red-400/70 hover:text-red-300"
            }
            bg-[#050505]/70
            transition
          `}
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? "Saindo..." : "Sair da conta"}
        </button>
      </section>

      {/* Estado de carregamento simples */}
      {loading && (
        <div className="fixed inset-0 pointer-events-none flex items-end justify-center pb-20">
          <div className="px-3 py-2 rounded-full bg-black/70 border border-white/10 text-[11px] text-[#E5E7EB]">
            Carregando seu perfil...
          </div>
        </div>
      )}
    </div>
  );
}
