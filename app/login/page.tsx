"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Image from "next/image";


const ACCENT_GRADIENT =
  "bg-[linear-gradient(180deg,#12E439_0%,#D8DE12_100%)]";
const BG_APP = "bg-[#0C0C0C]";
const BG_SURFACE = "bg-[#111111]";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!email || !senha) {
      setErro("Preencha seu e-mail e senha para continuar.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (error) {
        console.error(error);
        setErro("E-mail ou senha inválidos. Tente novamente.");
        return;
      }

      // Login ok → mandar para o app
      router.push("/aplicativo");
    } catch (err) {
      console.error(err);
      setErro("Ocorreu um erro ao entrar. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${BG_APP} min-h-screen flex flex-col`}>
      {/* Top bar / logo - fica simples no MVP */}
      <header className="w-full px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
  <Image
    src="/logoo.svg"
    alt="Pilates Diário"
    width={32}
    height={32}
    className="rounded-2xl"
    priority
  />
  <div className="flex flex-col leading-tight">
    <span className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase">
      Pilates Diário
    </span>
    <span className="text-sm font-semibold text-white">
      Entrar no app
    </span>
  </div>
</div>

      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        {/* Card central — mobile first */}
        <div
          className={`
            w-full max-w-md rounded-3xl ${BG_SURFACE} 
            border border-white/5 shadow-[0_18px_45px_rgba(0,0,0,0.45)]
            px-5 py-6 md:px-8 md:py-8
          `}
        >
          {/* Título e subtítulo */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase">
              Acesse sua conta
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white">
              Bem-vinda de volta 👋
            </h1>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Faça login para continuar seu treino diário de pilates.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#D4D4D8]"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`
                  w-full rounded-2xl border border-white/10 
                  bg-black/40 px-3.5 py-2.5 text-sm text-white
                  placeholder:text-[#6B7280]
                  focus:outline-none focus:ring-2 focus:ring-[#12E439]/70 focus:border-transparent
                  transition
                `}
                placeholder="seuemail@exemplo.com"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="senha"
                className="block text-xs font-medium text-[#D4D4D8]"
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`
                  w-full rounded-2xl border border-white/10 
                  bg-black/40 px-3.5 py-2.5 text-sm text-white
                  placeholder:text-[#6B7280]
                  focus:outline-none focus:ring-2 focus:ring-[#12E439]/70 focus:border-transparent
                  transition
                `}
                placeholder="Digite sua senha"
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  className="text-[11px] text-[#A1A1AA] hover:text-white transition"
                  // No MVP só deixa visual — depois conectamos a recuperação de senha
                  onClick={() =>
                    alert(
                      "Recuperação de senha vem no próximo passo do MVP :)"
                    )
                  }
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full h-11 rounded-full text-sm font-semibold text-[#0C0C0C]
                flex items-center justify-center
                ${ACCENT_GRADIENT}
                shadow-[0_12px_30px_rgba(16,185,129,0.35)]
                disabled:opacity-60 disabled:cursor-not-allowed
                mt-3
              `}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {/* Rodapé do card */}
            <p className="text-[11px] text-center text-[#6B7280] mt-3">
              Sua conta é criada automaticamente após a assinatura. <br />
              Verifique o e-mail que você usou na compra.
            </p>
          </form>
        </div>

        {/* Textinho extra lá embaixo no mobile */}
        <p className="mt-6 text-[11px] text-center text-[#6B7280] max-w-xs">
          Dica: adicione o Pilates Diário à tela inicial do seu celular para
          usar como se fosse um aplicativo nativo.
        </p>
      </main>
    </div>
  );
}
