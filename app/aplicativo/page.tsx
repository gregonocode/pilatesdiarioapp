"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Sparkles, PlayCircle, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";


const ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#12E439_0%,#D8DE12_100%)]";

type Exercicio = {
  id: number;
  titulo: string;
  descricao: string | null;
  video_url: string;
  duracao_segundos: number | null;
  nivel: string | null;
  ordem_dia: number;
  ativo: boolean;
};

type Profile = {
  id: string;
  nome: string | null;
  pontos: number;
  total_exercicios: number;
};

export default function AplicativoHomePage() {
  const supabase = supabaseBrowser();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

    // Timer de liberação do botão "Concluir"
  useEffect(() => {
    if (!hasStarted || !exercicio) return;

    setCanComplete(false);

    // usa a duração do exercício; se não tiver, cai num default de 30s
    const duracaoMs = (exercicio.duracao_segundos ?? 30) * 1000;

    const timeout = setTimeout(() => {
      setCanComplete(true);
    }, duracaoMs);

    return () => clearTimeout(timeout);
  }, [hasStarted, exercicio]);


  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErro(null);

        // 1) Usuário logado
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setErro("Você precisa estar logada para ver o treino de hoje.");
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // 2) Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, nome, pontos, total_exercicios")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Erro ao carregar profile:", profileError);
        } else {
          setProfile(profileData as Profile);
        }

        // 3) Já concluiu hoje?
        const hoje = new Date();
        const dataIso = hoje.toISOString().slice(0, 10); // YYYY-MM-DD

        const { data: conclusaoHoje, error: conclError } = await supabase
          .from("exercicios_conclusoes")
          .select("id")
          .eq("user_id", user.id)
          .eq("data", dataIso)
          .maybeSingle();

        if (conclError && conclError.code !== "PGRST116") {
          // PGRST116 = no rows
          console.error("Erro ao verificar conclusão de hoje:", conclError);
        }

        if (conclusaoHoje) {
          setCompletedToday(true);
          setLoading(false);
          return;
        }

        // 4) Buscar exercícios ativos
        const { data: exercicios, error: exError } = await supabase
          .from("exercicios")
          .select("*")
          .eq("ativo", true)
          .order("ordem_dia", { ascending: true });

        if (exError) {
          console.error("Erro ao buscar exercícios:", exError);
          setErro("Não foi possível carregar o treino de hoje.");
          setLoading(false);
          return;
        }

        if (!exercicios || exercicios.length === 0) {
          setErro(
            "Ainda não há exercícios cadastrados. Em breve seu treino diário aparece aqui!"
          );
          setLoading(false);
          return;
        }

        // 5) Escolher exercício do dia com base em uma data base
        const exercicioDoDia = pickExercicioDoDia(exercicios as Exercicio[]);
        setExercicio(exercicioDoDia);
      } catch (err) {
        console.error("Erro geral ao carregar tela inicial:", err);
        setErro("Ocorreu um erro ao carregar o treino de hoje.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const nomeUsuario = useMemo(() => {
    if (profile?.nome) return profile.nome.split(" ")[0];
    return "você";
  }, [profile]);

  function handleStart() {
    setHasStarted(true);
  }

  async function handleConfirmComplete() {
    if (!userId || !exercicio) return;

    try {
      setSaving(true);
      setErro(null);

      const hoje = new Date();
      const dataIso = hoje.toISOString().slice(0, 10);

      // 1) Registrar conclusão
      const { error: insertError } = await supabase
        .from("exercicios_conclusoes")
        .insert({
          user_id: userId,
          exercicio_id: exercicio.id,
          data: dataIso,
          pontos_ganhos: 25,
        });

      if (insertError) {
        // unique violation (já concluiu) etc.
        console.error("Erro ao registrar conclusão:", insertError);
        setErro(
          "Não foi possível registrar a conclusão agora. Se o problema persistir, tente novamente mais tarde."
        );
        return;
      }

      // 2) Atualizar profile (pontos + treinos)
      if (profile) {
        const novosPontos = (profile.pontos ?? 0) + 25;
        const novosTreinos = (profile.total_exercicios ?? 0) + 1;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            pontos: novosPontos,
            total_exercicios: novosTreinos,
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Erro ao atualizar pontos no profile:", updateError);
        } else {
          setProfile({
            ...profile,
            pontos: novosPontos,
            total_exercicios: novosTreinos,
          });
        }
      }

      setCompletedToday(true);
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Erro ao concluir treino:", err);
      setErro("Algo deu errado ao concluir o treino. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  /* -------------------- RENDER -------------------- */

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="px-4 py-2 rounded-full bg-black/70 border border-white/10 text-[12px] text-[#E5E7EB]">
          Carregando seu treino de hoje...
        </div>
        
        </div>
      
    );
  }

  if (completedToday) {
    return (
      <div className="space-y-5 pb-4 mt-2">
        <header>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#D8DE12]" />
            Treino de hoje concluído
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Muito bem, {nomeUsuario}! 💚
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
           <strong> Você está transformando sua rotina!</strong> Amanhã eu te
            espero aqui para o próximo exercício.
          </p>
        </header>

        <section
          className="
            rounded-3xl border border-white/8 bg-[#111111]
            px-4 py-4 space-y-3
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-10 h-10 rounded-2xl flex items-center justify-center
                bg-[#D9FCE0]
              "
            >
              <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#E5E7EB]">
                Hoje você já fez sua parte ✨
              </p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                O próximo treino libera automaticamente a partir de{" "}
                <span className="font-medium text-white">00:00</span>. Volte
                amanhã para continuar sua sequência.
              </p>
            </div>
          </div>

          <div
            className="
              mt-2 rounded-2xl bg-[#D9FCE0] px-4 py-3 
              flex items-center justify-between gap-4
            "
          >
            <div>
              <p className="text-[11px] font-semibold text-[#14532D] uppercase tracking-[0.18em] text-bold">
                Consistência  perfeição
              </p>
              <p className="mt-1 text-[13px] text-[#14532D]">
                Melhor 1% todos os dias. O importante é aparecer
                aqui, todo dia, só por alguns minutos, e você já fez isso hoje.
              </p>
            </div>
          </div>
          {/* Imagem abaixo do bloco verde */}
          <div className="mt-2 flex justify-center">
            <Image
              src="/meditando.webp"
              alt="Mulher meditando após concluir o treino de hoje"
              width={450}
              height={450}
              className="h-auto w-auto max-w-full"
            />
          </div>
        </section>

        {erro && (
          <p className="text-[12px] text-center text-red-300/90">{erro}</p>
        )}
      </div>
    );
  }

  const videoSrc =
    exercicio && exercicio.video_url
      ? exercicio.video_url +
        (hasStarted
          ? exercicio.video_url.includes("?")
            ? "&autoplay=true"
            : "?autoplay=true"
          : "")
      : "";

  return (
    <div className="space-y-5 pb-4 mt-2">
      {/* Header */}
      <header>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#D8DE12]" />
          Treino do dia
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Seu exercício de hoje 💚
        </h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Aperte o play, faça o treino até o final e depois marque como
          concluído para ganhar seus pontos.
        </p>
      </header>

      {/* Card com vídeo */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-3.5 py-3.5 space-y-3
        "
      >
        {exercicio ? (
          <>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-[0.18em]">
                Exercício do dia #{exercicio.ordem_dia}
              </p>
              <h2 className="text-sm font-semibold text-white">
                {exercicio.titulo}
              </h2>
              {exercicio.descricao && (
                <p className="text-[12px] text-[#9CA3AF]">
                  {exercicio.descricao}
                </p>
              )}
            </div>

            {/* Player vertical (Bunny embed via iframe) */}
            <div className="mt-2 rounded-3xl overflow-hidden border border-white/10 bg-black">
              <div className="relative w-full aspect-[9/16] bg-black">
                <iframe
                  src={videoSrc}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>


            {/* Ações */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className={`
                  w-full h-11 rounded-full text-sm font-semibold
                  flex items-center justify-center gap-2
                  transition
                  ${
                    hasStarted
                      ? "bg-[#050505]/80 border border-white/10 text-[#E5E7EB]"
                      : `${ACCENT_GRADIENT} text-[#0C0C0C] shadow-[0_12px_30px_rgba(16,185,129,0.35)]`
                  }
                `}
              >
                <PlayCircle className="w-5 h-5" />
                {hasStarted ? "Continuar assistindo" : "Iniciar treino de hoje"}
              </button>

              <button
                type="button"
                disabled={!hasStarted || !canComplete}
                onClick={() => setShowConfirmModal(true)}
                className={`
                  w-full h-10 rounded-full text-[13px] font-medium
                  flex items-center justify-center gap-2
                  ${
                    !hasStarted || !canComplete
                      ? "border border-white/10 text-[#9CA3AF] bg-[#050505]/60"
                      : `${ACCENT_GRADIENT} text-[#0C0C0C] shadow-[0_12px_30px_rgba(16,185,129,0.35)] border-0`
                  }
                  transition
                `}
              >
                <CheckCircle2 className="w-4 h-4" />
                {hasStarted && !canComplete
                  ? "Concluir treino (aguarde alguns segundos)"
                  : "Concluir treino"}
              </button>

              <p className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Depois de concluir, você ganha{" "}
                <span className="font-semibold text-[#E5E7EB]">
                  +25 pontos
                </span>{" "}
                e libera o próximo treino a partir de 00:00.
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-[#E5E7EB]">
            Ainda não há um exercício configurado para hoje. Em breve seu treino
            diário aparece aqui 💚
          </p>
        )}
      </section>

      {erro && (
        <p className="text-[12px] text-center text-red-300/90">{erro}</p>
      )}

      {/* Modal de confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-[#111111] border border-white/10 px-5 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="
                  w-9 h-9 rounded-2xl flex items-center justify-center
                  bg-[#D9FCE0]
                "
              >
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Você concluiu esse treino?
                </h3>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                  Ao confirmar, vamos marcar esse exercício como concluído, te
                  dar +25 pontos e liberar um novo treino amanhã.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={saving}
                className={`
                  w-full h-10 rounded-full text-[13px] font-semibold
                  flex items-center justify-center gap-2
                  text-[#0C0C0C]
                  ${ACCENT_GRADIENT}
                  disabled:opacity-70
                `}
              >
                {saving ? "Salvando..." : "Sim, concluir treino e ganhar +25 pontos"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="
                  w-full h-10 rounded-full text-[13px] font-medium
                  border border-white/20 text-[#E5E7EB]
                  bg-[#050505]
                "
              >
                Ainda não concluí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Helpers -------------------- */

function pickExercicioDoDia(exercicios: Exercicio[]): Exercicio {
  if (exercicios.length === 0) {
    throw new Error("Lista de exercícios vazia");
  }

  // Define a data base em horário local (sem "Z")
  // Janeiro é mês 0 no JS
  const baseDate = new Date(2025, 0, 1); // 01/01/2025 local

  const today = new Date();

  const baseMid = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate()
  ).getTime();

  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const diffDays = Math.max(
    0,
    Math.floor((todayMid - baseMid) / 86_400_000) // 1000*60*60*24
  );

  const index = diffDays % exercicios.length;
  return exercicios[index];
}




