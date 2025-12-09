// src/app/api/admin/exercicios/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type ApiResponse =
  | {
      ok: true;
      exercicio: unknown;
    }
  | {
      ok: false;
      message: string;
    };

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = (await req.json()) as {
      guid?: string;
      titulo?: string;
      descricao?: string;
      nivel?: string | null;
      ordem_dia?: number;
      duracao_segundos?: number | null;
    };

    const { guid, titulo, descricao, nivel, ordem_dia, duracao_segundos } = body;

    if (!guid) {
      return NextResponse.json(
        { ok: false, message: "GUID do vídeo é obrigatório." },
        { status: 400 }
      );
    }

    if (!titulo) {
      return NextResponse.json(
        { ok: false, message: "Título é obrigatório." },
        { status: 400 }
      );
    }

    if (!ordem_dia || ordem_dia <= 0) {
      return NextResponse.json(
        { ok: false, message: "Ordem/dia inválido." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const libraryId = process.env.BUNNY_LIBRARY_ID;

    if (!libraryId) {
      return NextResponse.json(
        {
          ok: false,
          message: "BUNNY_LIBRARY_ID não está configurado.",
        },
        { status: 500 }
      );
    }

    // 🔐 garante que é o admin
    const cookieStore = await cookies();

    const supabaseServer = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    });

    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    const adminEmail = adminEmailEnv?.trim().toLowerCase() ?? null;
    const userEmail = user?.email?.trim().toLowerCase() ?? null;

    if (!user || (adminEmail && userEmail !== adminEmail)) {
      return NextResponse.json(
        { ok: false, message: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    // Monta a URL de embed a partir do guid
    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`;

    // Inserir na tabela exercicios usando service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabaseAdmin
      .from("exercicios")
      .insert([
        {
          titulo,
          descricao: descricao || null,
          video_url: embedUrl,
          duracao_segundos: duracao_segundos ?? null,
          nivel: nivel || null,
          ordem_dia,
          ativo: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir exercício no Supabase:", error);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao salvar o exercício no banco.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        exercicio: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro geral em /api/admin/exercicios/create:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno ao criar exercício.",
      },
      { status: 500 }
    );
  }
}
