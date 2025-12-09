// src/app/admin/dashboard/exercicios/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { Upload, Video, Info, Loader2, CheckCircle2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { Upload as TusUpload } from "tus-js-client";

type InitUploadResponse = {
  success: boolean;
  message: string;
  guid?: string;
  tusEndpoint?: string;
  signature?: string;
  expire?: number;
  libraryId?: string;
  videoUrl?: string;
  embedUrl?: string;
};

export default function AdminExerciciosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nivel, setNivel] = useState("iniciante");
  const [ordemDia, setOrdemDia] = useState<string>("");
  const [duracaoMinutos, setDuracaoMinutos] = useState<string>("");

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [lastCreatedTitle, setLastCreatedTitle] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      toast.error("Selecione um vídeo para enviar.");
      return;
    }

    if (!titulo.trim()) {
      toast.error("Informe um título para o exercício.");
      return;
    }

    if (!ordemDia) {
      toast.error("Informe a ordem/dia desse exercício no programa.");
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      setLastCreatedTitle(null);

      // 1) Pede pro backend criar o vídeo no Bunny e gerar assinatura TUS
      const initRes = await fetch("/api/upload-bunny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo.trim() }),
      });

      const initData = (await initRes.json()) as InitUploadResponse;

      if (!initRes.ok || !initData.success || !initData.guid) {
        console.error("Erro no init upload Bunny:", initData);
        toast.error(
          initData?.message ??
            "Não foi possível preparar o upload no Bunny. Tente novamente."
        );
        setIsUploading(false);
        setProgress(null);
        return;
      }

      const {
        guid,
        tusEndpoint,
        signature,
        expire,
        libraryId,
      } = initData;

      if (!tusEndpoint || !signature || !expire || !libraryId) {
        toast.error(
          "Resposta incompleta do servidor para upload Bunny (faltam headers)."
        );
        setIsUploading(false);
        setProgress(null);
        return;
      }

      const duracao_segundos =
        duracaoMinutos && Number(duracaoMinutos) > 0
          ? Math.round(Number(duracaoMinutos) * 60)
          : undefined;

      // 2) Upload direto pro Bunny com TUS
      await new Promise<void>((resolve, reject) => {
        const upload = new TusUpload(file, {
          endpoint: tusEndpoint,
          metadata: {
            filetype: file.type || "video/mp4",
            title: titulo.trim(),
          },
          headers: {
            // conforme docs da Bunny TUS
            AuthorizationSignature: signature,
            AuthorizationExpire: expire.toString(),
            LibraryId: libraryId.toString(),
            VideoId: guid,
          },
          retryDelays: [0, 3000, 5000, 10000, 20000],
          onError(error) {
            console.error("Erro no upload TUS:", error);
            reject(error);
          },
          onProgress(bytesSent, bytesTotal) {
            if (bytesTotal > 0) {
              const pct = Math.round((bytesSent / bytesTotal) * 100);
              setProgress(pct);
            }
          },
          async onSuccess() {
            try {
              // 3) Depois que o upload terminou, salvar o exercício no Supabase
              const createRes = await fetch(
                "/api/admin/exercicios/create",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    guid,
                    titulo: titulo.trim(),
                    descricao: descricao.trim() || null,
                    nivel,
                    ordem_dia: Number(ordemDia),
                    duracao_segundos:
                      duracao_segundos ?? null,
                  }),
                }
              );

              const createData = await createRes.json();

              if (!createRes.ok || !createData.ok) {
                console.error(
                  "Erro ao criar exercício no banco:",
                  createData
                );
                toast.error(
                  createData?.message ??
                    "Upload concluído, mas houve erro ao salvar o exercício."
                );
                reject(
                  new Error(
                    createData?.message ??
                      "Erro ao salvar exercício no banco."
                  )
                );
                return;
              }

              setLastCreatedTitle(titulo.trim());
              toast.success("Vídeo enviado e exercício cadastrado com sucesso!");
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });

        upload.start();
      });

      // reset básico do formulário
      setFile(null);
      (e.target as HTMLFormElement).reset();
      setTitulo("");
      setDescricao("");
      setNivel("iniciante");
      setOrdemDia("");
      setDuracaoMinutos("");
      setProgress(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao enviar o vídeo.");
      setProgress(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Exercícios
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Enviar vídeos de Pilates
          </h1>
          <p className="text-sm text-slate-500">
            Agora o upload é feito direto do seu navegador para o Bunny (TUS),
            sem passar pelo servidor da Vercel. Depois disso, o exercício é salvo
            na tabela <code>exercicios</code>.
          </p>
        </header>

        {/* Card de instrução */}
        <section className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex gap-3">
          <div className="mt-1">
            <Video className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              Recomendações de upload
            </p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
              <li>Formato vertical (9:16), ex: 1080x1920.</li>
              <li>Vídeos curtos (1–5 minutos) para o treino diário.</li>
              <li>
                O campo &quot;Ordem no programa&quot; define o dia que esse
                exercício aparece.
              </li>
            </ul>
          </div>
        </section>

        {/* Form de upload */}
        <section className="bg-white border border-slate-200 rounded-2xl px-5 py-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Título do exercício
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Alongamento de coluna com respiração"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              {/* Ordem */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Ordem no programa (dia)
                </label>
                <input
                  type="number"
                  min={1}
                  value={ordemDia}
                  onChange={(e) => setOrdemDia(e.target.value)}
                  placeholder="1, 2, 3..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nível */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Nível
                </label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-white"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>

              {/* Duração em minutos */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Duração estimada (minutos)
                </label>
                <input
                  type="number"
                  min={1}
                  value={duracaoMinutos}
                  onChange={(e) => setDuracaoMinutos(e.target.value)}
                  placeholder="Ex: 3"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {/* Arquivo */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Vídeo (MP4 / vertical)
                </label>
                <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 cursor-pointer hover:border-slate-400">
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-slate-500" />
                    {file ? file.name : "Selecione o arquivo de vídeo"}
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f || null);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Descrição / observações
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="Ex: foco em mobilidade de coluna e respiração profunda. Ideal para começar o dia."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
              />
            </div>

            {/* Rodapé do form */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Info className="h-3.5 w-3.5" />
                <span>
                  O vídeo é enviado direto para o Bunny (TUS) e depois o
                  exercício é salvo na tabela <code>exercicios</code>.
                </span>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress !== null
                      ? `Enviando... ${progress}%`
                      : "Preparando upload..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Enviar vídeo para o Bunny
                  </>
                )}
              </button>
            </div>

            {lastCreatedTitle && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  Último exercício cadastrado:{" "}
                  <span className="font-semibold">{lastCreatedTitle}</span>
                </span>
              </div>
            )}
          </form>
        </section>
      </div>
    </>
  );
}
