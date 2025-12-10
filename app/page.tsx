import Link from "next/link";
import { Sparkles, PlayCircle } from "lucide-react";

const ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#12E439_0%,#D8DE12_100%)]";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0C0C0C] px-5 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.8)]">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[#E5E7EB] mb-4">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#111111]">
            <Sparkles className="w-3 h-3 text-[#D8DE12]" />
          </span>
          Pilates Diário · App
        </div>

        {/* Título + texto */}
        <h1 className="text-2xl font-bold leading-snug">
          Seu momento diário{" "}
          <span className="text-[#BBF7D0]">de pilates</span> em poucos minutos.
        </h1>

        <p className="mt-3 text-sm text-[#9CA3AF]">
          Um exercício por dia, sem pressão. Você só dá o play, faz o treino
          e acompanha sua evolução no ranking com outras alunas.
        </p>

        {/* Destaques rápidos */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[#D1D5DB]">
          <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
            <p className="font-semibold text-[12px]">Treino diário</p>
            <p className="mt-0.5 text-[#9CA3AF]">
              1 exercício novo por dia, pensado pra rotina corrida.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
            <p className="font-semibold text-[12px]">Pontos &amp; ranking</p>
            <p className="mt-0.5 text-[#9CA3AF]">
              Ganhe pontos, suba no ranking e acompanhe sua consistência.
            </p>
          </div>
        </div>

        {/* CTA principal */}
        <div className="mt-6 space-y-2">
          <Link
            href="/login"
            className={`
              flex items-center justify-center gap-2
              h-11 w-full rounded-full text-sm font-semibold
              text-[#050505]
              ${ACCENT_GRADIENT}
              shadow-[0_14px_35px_rgba(34,197,94,0.45)]
              transition-transform duration-150 active:scale-[0.97]
            `}
          >
            <PlayCircle className="w-4 h-4" />
            Entrar no app
          </Link>

          <p className="text-[11px] text-center text-[#6B7280]">
            Ainda não é aluna? Use o mesmo link que recebeu para acessar o
            aplicativo e salvar na tela inicial do seu celular.
          </p>
        </div>
      </section>
    </main>
  );
}
