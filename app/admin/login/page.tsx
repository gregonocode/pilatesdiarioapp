// src/app/admin/login/page.tsx
"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Mail, Lock } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { supabaseBrowser } from "@/lib/supabase-browser";

const ACCENT = "#12E439";
// E-mail do admin continua só aqui no front, mas não é exibido
const ADMIN_EMAIL = "coueamarca@gmail.com";

type VerifyResponse =
  | { ok: true }
  | { ok: false; message?: string };

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCodeGateOpen, setIsCodeGateOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  async function handleSendMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isCodeGateOpen) {
      toast.error("Você precisa desbloquear o envio antes.");
      return;
    }

    try {
      setIsSubmitting(true);

      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin/dashboard`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: ADMIN_EMAIL,
        options: {
          shouldCreateUser: false,
          emailRedirectTo,
        },
      });

      if (error) {
        console.error(error);
        toast.error("Erro ao enviar o link. Tente novamente.");
        return;
      }

      toast.success(
        "Enviamos um link de acesso seguro para o e-mail do administrador."
      );
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenCodeModal() {
    setCodeInput("");
    setShowCodeModal(true);
  }

  function handleCloseCodeModal() {
    setShowCodeModal(false);
  }

  async function handleSubmitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const code = codeInput.trim();

    if (!code) {
      toast.error("Digite o código de segurança.");
      return;
    }

    try {
      const res = await fetch("/api/admin/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = (await res.json()) as VerifyResponse;

      if (!res.ok) {
        toast.error("Erro ao validar o código.");
        return;
      }

      if (!data.ok) {
        toast.error(data.message ?? "Código inválido.");
        return;
      }

      setIsCodeGateOpen(true);
      setShowCodeModal(false);
      toast.success("Código de segurança validado.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao validar o código.");
    }
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200 relative">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${ACCENT}20` }}
              >
                <ShieldCheck size={22} style={{ color: ACCENT }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Pilates Diário · Admin
                </h1>
                <p className="text-sm text-slate-500">
                  Acesso restrito. Apenas o administrador principal pode
                  solicitar o link de acesso.
                </p>
              </div>
            </div>

            {/* Etapa 1: Desbloquear envio via código */}
            {!isCodeGateOpen && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Antes de enviar o link de acesso, é necessário informar um{" "}
                    <span className="font-semibold">código de segurança</span>.
                  </p>
                  <p className="text-xs text-slate-400">
                    Isso adiciona uma barreira extra para evitar que alguém
                    dispare links de acesso por engano.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCodeModal}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  Desbloquear envio de link
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Após validar o código, o botão para envio do link será
                  liberado.
                </p>
              </div>
            )}

            {/* Etapa 2: Enviar Magic Link (aparece só depois do código correto) */}
            {isCodeGateOpen && (
              <form onSubmit={handleSendMagicLink} className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    O código de segurança foi validado. Agora você pode enviar
                    um{" "}
                    <span className="font-semibold">
                      link mágico de acesso
                    </span>{" "}
                    para o e-mail do administrador.
                  </p>
                  <p className="text-xs text-slate-400">
                    Por segurança, o endereço de e-mail não é exibido aqui.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ACCENT }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando link de acesso...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Enviar link de acesso para o admin
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Você pode fechar esta página após enviar o link. O acesso será
                  concluído pelo e-mail.
                </p>
              </form>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Pilates Diário · Painel administrativo interno
          </p>
        </div>
      </div>

      {/* Modal de código de segurança */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${ACCENT}20` }}
              >
                <Lock size={18} style={{ color: ACCENT }} />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Código de segurança
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Digite o código de segurança para liberar o envio do link de
              acesso administrativo.
            </p>

            <form onSubmit={handleSubmitCode} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Digite o código"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-0"
                style={{ borderColor: `${ACCENT}40`, boxShadow: "none" }}
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCodeModal}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Validar código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
