"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Crown, Flame, Award, Users } from "lucide-react";

const ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#12E439_0%,#D8DE12_100%)]";

type RankingRow = {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  pontos: number;
  total_exercicios: number;
  posicao: number;
};

export default function RankingPage() {
  const supabase = supabaseBrowser();

  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [meuRanking, setMeuRanking] = useState<RankingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(userError);
        }

        if (!user) {
          setErro("Você precisa estar logada para ver o ranking.");
          setLoading(false);
          return;
        }

        // Top 50
        const { data: rankingData, error: rankingError } = await supabase
          .from("ranking_usuarios")
          .select("*")
          .order("posicao", { ascending: true })
          .limit(50);

        if (rankingError) {
          console.error("Erro ao buscar ranking:", rankingError);
          setErro("Não foi possível carregar o ranking agora.");
        } else {
          setRanking((rankingData || []) as RankingRow[]);
        }

        // Minha posição
        const { data: myRow, error: myError } = await supabase
          .from("ranking_usuarios")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (myError) {
          console.error("Erro ao buscar meu ranking:", myError);
        } else if (myRow) {
          setMeuRanking(myRow as RankingRow);
        }
      } catch (err) {
        console.error("Erro geral ranking:", err);
        setErro("Ocorreu um erro ao carregar o ranking.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const visibleList = showAll ? ranking : ranking.slice(0, 20);

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <header className="mt-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase">
          Ranking
        </p>
        <h1 className="mt-1 text-xl font-bold text-white flex items-center gap-2">
          Top treinadoras do dia
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#E5E7EB]">
            <Users className="w-3 h-3" />
            {ranking.length} no ranking
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">
          Complete seus treinos diários para subir de posição e acumular pontos.
        </p>
      </header>

      {/* Card verde com posição do usuário */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-4 py-4 space-y-3
        "
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#A1A1AA] uppercase">
              Sua posição
            </p>
            {meuRanking ? (
              <>
                <p className="mt-1 text-sm text-[#E5E7EB]">
                  Você está em{" "}
                  <span className="font-semibold text-white">
                    {meuRanking.posicao}º lugar
                  </span>{" "}
                  no ranking geral.
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-[#E5E7EB]">
                Comece a treinar para aparecer no ranking das top treinadoras.
              </p>
            )}
          </div>
          <div
            className="
              hidden xs:flex w-10 h-10 rounded-2xl 
              items-center justify-center 
              bg-white/5
            "
          >
            <Crown className="w-4 h-4 text-[#FACC15]" />
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
              Seu desempenho
            </p>
            <p className="mt-1 text-base font-bold text-[#052E16]">
              {meuRanking?.pontos ?? 0} pontos
            </p>
            <p className="text-[11px] text-[#166534] mt-0.5">
              {meuRanking?.total_exercicios ?? 0} treinos concluídos.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166534]">
              <Flame className="w-3 h-3" />
              {meuRanking?.pontos
                ? meuRanking.pontos >= 500
                  ? "Ritmo avançado"
                  : meuRanking.pontos >= 200
                  ? "Ritmo firme"
                  : "Começando bem"
                : "Comece hoje"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D]">
              <Award className="w-3 h-3" />
              {meuRanking?.posicao
                ? `Top ${meuRanking.posicao}`
                : "Ainda fora do top"}
            </span>
          </div>
        </div>
      </section>

      {/* Lista de ranking */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-3 py-3 space-y-2
        "
      >
        <div className="flex items-center justify-between px-1 mb-1">
          <h2 className="text-sm font-semibold text-white">
            Top {showAll ? ranking.length : Math.min(20, ranking.length)}
          </h2>
          <p className="text-[11px] text-[#9CA3AF]">
            Pontos acumulados por treinos concluídos
          </p>
        </div>

        <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          {visibleList.map((row) => (
            <RankingItem
              key={row.id}
              row={row}
              isMe={row.id === meuRanking?.id}
            />
          ))}

          {!visibleList.length && !loading && (
            <p className="text-[12px] text-center text-[#9CA3AF] py-4">
              Ainda não há ninguém no ranking. Seja a primeira a concluir um
              treino hoje! 💚
            </p>
          )}
        </div>

        {/* Botão Ver mais / Ver menos */}
        {ranking.length > 20 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="
                w-full h-8 rounded-full text-[11px] font-medium
                border border-white/15 text-[#E5E7EB]
                bg-[#050505]/70
                hover:border-white/30 hover:bg-[#0A0A0A]
                transition
              "
            >
              {showAll ? "Mostrar apenas top 20" : "Ver top 50 completo"}
            </button>
          </div>
        )}
      </section>

      {/* Estados de erro/carregando */}
      {erro && (
        <p className="text-[12px] text-center text-red-300/90 mt-2">
          {erro}
        </p>
      )}

      {loading && (
        <div className="fixed inset-0 pointer-events-none flex items-end justify-center pb-20">
          <div className="px-3 py-2 rounded-full bg-black/70 border border-white/10 text-[11px] text-[#E5E7EB]">
            Carregando ranking...
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- ITEM DO RANKING -------------------- */

function RankingItem({
  row,
  isMe,
}: {
  row: RankingRow;
  isMe: boolean;
}) {
  const { posicao, nome, pontos, total_exercicios } = row;

  const { crownColor, bgGlow } = getCrownStyles(posicao);

  function getInitials() {
    const base = nome || "Pilates Lover";
    const parts = base.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <div
      className={`
        flex items-center gap-3 rounded-2xl px-2.5 py-2
        ${isMe ? "bg-white/5 border border-[#12E439]/40" : "bg-white/[0.01]"}
      `}
    >
      {/* Posição */}
      <div className="w-7 text-center">
        <span
          className={`
            text-[11px] font-semibold
            ${posicao <= 3 ? "text-white" : "text-[#9CA3AF]"}
          `}
        >
          {posicao}º
        </span>
      </div>

      {/* Avatar + nome */}
      <div className="flex items-center gap-2 flex-1">
        <div className="relative">
          <div className="w-8 h-8 rounded-2xl bg-[#050505] flex items-center justify-center text-[11px] font-semibold text-white border border-white/10">
            {getInitials()}
          </div>
          <div
            className={`
              absolute -top-1 -right-1 w-4 h-4 rounded-full 
              flex items-center justify-center border border-black/70
              ${bgGlow}
            `}
          >
            <Crown className={`w-2.5 h-2.5 ${crownColor}`} />
          </div>
        </div>
        <div className="flex flex-col">
          <span
            className={`
              text-[13px] font-medium 
              ${isMe ? "text-white" : "text-[#E5E7EB]"}
            `}
          >
            {nome || "Usuária sem nome"}
            {isMe && (
              <span className="ml-1 text-[10px] text-[#A7F3D0] bg-[#064E3B]/60 rounded-full px-1.5 py-px">
                você
              </span>
            )}
          </span>
          <span className="text-[11px] text-[#9CA3AF]">
            {total_exercicios} treinos • {pontos} pts
          </span>
        </div>
      </div>
    </div>
  );
}

function getCrownStyles(posicao: number) {
  // 1º dourada, 2º verde clarinho, 3º rosa clarinho, resto branca
  if (posicao === 1) {
    return {
      crownColor: "text-[#FACC15]", // dourado
      bgGlow: "bg-yellow-500/20",
    };
  }
  if (posicao === 2) {
    return {
      crownColor: "text-[#4ADE80]", // verde claro
      bgGlow: "bg-emerald-400/20",
    };
  }
  if (posicao === 3) {
    return {
      crownColor: "text-[#F9A8D4]", // rosa claro
      bgGlow: "bg-pink-400/20",
    };
  }
  return {
    crownColor: "text-white",
    bgGlow: "bg-white/10",
  };
}
