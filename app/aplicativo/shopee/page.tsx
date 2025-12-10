"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  ShoppingBag,
  Sparkles,
  Tag,
  ExternalLink,
  Filter,
} from "lucide-react";

const ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#12E439_0%,#D8DE12_100%)]";

type ShopeeProduto = {
  id: number;
  titulo: string;
  imagem_url: string | null;
  link_afiliado: string;
  categoria: string | null;
  ativo: boolean;
  created_at: string;
};

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400.png?text=Pilates+Di%C3%A1rio";

export default function ShopeePage() {
  const supabase = supabaseBrowser();

  const [produtos, setProdutos] = useState<ShopeeProduto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<string>("todas");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const { data, error } = await supabase
          .from("shopee_produtos")
          .select("*")
          .eq("ativo", true)
          .order("created_at", { ascending: false })
          .limit(60);

        if (error) {
          console.error("Erro ao buscar produtos Shopee:", error);
          setErro("Não foi possível carregar os produtos agora.");
        } else if (data) {
          setProdutos(data as ShopeeProduto[]);
        }
      } catch (err) {
        console.error("Erro geral Shopee:", err);
        setErro("Ocorreu um erro ao carregar os produtos.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    produtos.forEach((p) => {
      if (p.categoria && p.categoria.trim() !== "") {
        set.add(p.categoria);
      }
    });
    return Array.from(set);
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    if (categoriaSelecionada === "todas") return produtos;
    return produtos.filter(
      (p) => (p.categoria || "").toLowerCase() === categoriaSelecionada
    );
  }, [categoriaSelecionada, produtos]);

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <header className="mt-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#D8DE12]" />
          Shopeee
        </p>
        <h1 className="mt-1 text-xl font-bold text-white flex items-center gap-2">
          Produtos que combinam com seu treino
        </h1>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">
          Tapetes, acessórios e mimos que deixem seu momento de pilates ainda
          mais gostoso — tudo com links afiliados da Shopee.
        </p>
      </header>

      {/* Card destaque verdinho */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-4 py-4 space-y-3
        "
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#A1A1AA] uppercase">
              Dica rápida
            </p>
            <p className="mt-1 text-sm text-[#E5E7EB]">
              Escolha um tapete confortável e separado só para seus treinos de
              pilates. Isso ajuda seu cérebro a “entrar no modo treino” mais
              rápido.
            </p>
          </div>
          <div
            className="
              hidden xs:flex w-10 h-10 rounded-2xl 
              items-center justify-center 
              bg-white/5
            "
          >
            <ShoppingBag className="w-4 h-4 text-[#D4D4D8]" />
          </div>
        </div>

        <div
          className="
            mt-2 rounded-2xl bg-[#D9FCE0] px-4 py-3 
            flex items-center justify-between gap-4
          "
        >
          <div>
            <p className="text-[11px] font-semibold text-[#14532D] uppercase tracking-[0.18em]">
              Compras conscientes
            </p>
            <p className="mt-1 text-[13px] text-[#14532D]">
              Comece com o essencial: um bom tapete e, se quiser, uma faixinha
              elástica. Você não precisa de um monte de coisas pra treinar
              firme.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 text-[10px] text-[#166534]">
            <span>Use só o que fizer sentido</span>
            <span className="inline-flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Pilate-se, não se aperte 💚
            </span>
          </div>
        </div>
      </section>

      {/* Filtros de categoria */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-3 py-3 space-y-2
        "
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-[#E5E7EB]" />
            <h2 className="text-sm font-semibold text-white">
              Filtrar por categoria
            </h2>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            {produtosFiltrados.length} itens
          </p>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <CategoriaChip
            label="Todas"
            value="todas"
            atual={categoriaSelecionada}
            onClick={setCategoriaSelecionada}
          />
          {categorias.map((cat) => (
            <CategoriaChip
              key={cat}
              label={formatCategoria(cat)}
              value={cat.toLowerCase()}
              atual={categoriaSelecionada}
              onClick={setCategoriaSelecionada}
            />
          ))}
        </div>
      </section>

      {/* Lista de produtos */}
      <section
        className="
          rounded-3xl border border-white/8 bg-[#111111]
          px-3 py-3
        "
      >
        <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
          {produtosFiltrados.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} />
          ))}

          {!produtosFiltrados.length && !loading && (
            <p className="text-[12px] text-center text-[#9CA3AF] py-4">
              Ainda não há produtos cadastrados. Em breve você vai ver aqui
              sugestões de tapetes, faixas e outros mimos da Shopee. ✨
            </p>
          )}
        </div>
      </section>

      {/* Erro / Loading */}
      {erro && (
        <p className="text-[12px] text-center text-red-300/90 mt-2">
          {erro}
        </p>
      )}

      {loading && (
        <div className="fixed inset-0 pointer-events-none flex items-end justify-center pb-20">
          <div className="px-3 py-2 rounded-full bg-black/70 border border-white/10 text-[11px] text-[#E5E7EB]">
            Carregando produtos da Shopee...
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- COMPONENTES AUXILIARES -------------------- */

type CategoriaChipProps = {
  label: string;
  value: string;
  atual: string;
  onClick: (value: string) => void;
};

function CategoriaChip({
  label,
  value,
  atual,
  onClick,
}: CategoriaChipProps) {
  const isActive = value === atual;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`
        inline-flex items-center gap-1 rounded-full px-3 py-1
        text-[11px] font-medium
        border
        ${
          isActive
            ? "border-transparent text-[#0C0C0C] " + ACCENT_GRADIENT
            : "border-white/15 text-[#E5E7EB] bg-[#050505]/70 hover:border-white/40"
        }
        transition
      `}
    >
      {label}
    </button>
  );
}

function ProdutoCard({ produto }: { produto: ShopeeProduto }) {
  const imgSrc = produto.imagem_url || FALLBACK_IMG;
  const categoria = formatCategoria(produto.categoria);

  return (
    <article
      className="
        flex gap-3 rounded-2xl bg-white/[0.02] 
        border border-white/8 px-2.5 py-2.5
      "
    >
      {/* Imagem */}
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#050505] border border-white/10">
        {/* Para evitar config extra, uso <img> simples */}
        {/* Se quiser, pode trocar por <Image /> do next/image depois */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={produto.titulo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Texto / info */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="text-[13px] font-semibold text-white line-clamp-2">
          {produto.titulo}
        </h3>
        <p className="mt-1 text-[11px] text-[#9CA3AF]">
          {categoria || "Pilates & bem-estar"}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#A1A1AA]">
            <Tag className="w-3 h-3" />
            Shopee • Afiliado
          </span>

          <a
            href={produto.link_afiliado}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex items-center gap-1.5 text-[11px] font-semibold
              rounded-full px-3 py-1.5 text-[#0C0C0C]
              ${ACCENT_GRADIENT}
              shadow-[0_10px_25px_rgba(132,204,22,0.45)]
              whitespace-nowrap
            `}
          >
            Ver na Shopee
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

function formatCategoria(categoria: string | null | undefined): string {
  if (!categoria) return "";
  const c = categoria.trim().toLowerCase();
  if (!c) return "";
  return c.charAt(0).toUpperCase() + c.slice(1);
}
