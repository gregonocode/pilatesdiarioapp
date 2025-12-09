// src/app/api/admin/exercicios/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type ApiResponse =
  | {
      ok: true;
      videoId: string;
      embedUrl: string;
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
    const formData = await req.formData();

    const file = formData.get("file");
    const titulo = (formData.get("titulo") ?? "").toString().trim();
    const descricao = (formData.get("descricao") ?? "").toString().trim();
    const nivelRaw = (formData.get("nivel") ?? "").toString().trim();
    const nivel = nivelRaw || null;
    const ordemDiaStr = (formData.get("ordem_dia") ?? "").toString().trim();
    const duracaoSegundosStr = (formData.get("duracao_segundos") ?? "")
      .toString()
      .trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Arquivo de vídeo não enviado." },
        { status: 400 }
      );
    }

    if (!titulo) {
      return NextResponse.json(
        { ok: false, message: "Título do exercício é obrigatório." },
        { status: 400 }
      );
    }

    const ordem_dia = parseInt(ordemDiaStr, 10);
    if (!Number.isFinite(ordem_dia) || ordem_dia <= 0) {
      return NextResponse.json(
        { ok: false, message: "Ordem/dia inválido." },
        { status: 400 }
      );
    }

    const duracao_segundos = duracaoSegundosStr
      ? parseInt(duracaoSegundosStr, 10)
      : null;

    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const bunnyApiKey = process.env.BUNNY_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!libraryId || !bunnyApiKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Configuração do Bunny ausente. Verifique BUNNY_LIBRARY_ID e BUNNY_API_KEY.",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Configuração do Supabase ausente. Verifique URL, ANON_KEY e SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      );
    }

    // 🔐 Verificar se é o admin logado (via cookie do Supabase)
    const cookieStore = await cookies();
    const supabaseServer = createServerClient(supabaseUrl, anonKey, {
      cookies:  {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // não precisamos setar cookies aqui
        },
        remove() {
          // nem remover
        },
      },
    });

    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user || (adminEmail && user.email !== adminEmail)) {
      return NextResponse.json(
        { ok: false, message: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    // 1) Criar vídeo no Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: bunnyApiKey,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: titulo || file.name,
        }),
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("Erro ao criar vídeo no Bunny:", text);
      return NextResponse.json(
        {
          ok: false,
          message: "Falha ao criar o vídeo na library do Bunny.",
        },
        { status: 502 }
      );
    }

    const createJson = (await createRes.json()) as { guid?: string };
    const videoId = createJson.guid;

    if (!videoId) {
      console.error("Resposta de criação sem guid:", createJson);
      return NextResponse.json(
        {
          ok: false,
          message:
            "Bunny não retornou um videoId (guid). Verifique as credenciais.",
        },
        { status: 502 }
      );
    }

    // 2) Upload binário do arquivo para o Bunny
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
          headers: {
            AccessKey: bunnyApiKey,
            "content-type": "application/octet-stream",
          },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error("Erro ao fazer upload de vídeo para o Bunny:", text);
      return NextResponse.json(
        {
          ok: false,
          message: "Falha ao enviar o arquivo de vídeo para o Bunny.",
        },
        { status: 502 }
      );
    }

    // 3) Montar a URL (por enquanto vamos guardar a URL de embed)
    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;

    // 4) Salvar na tabela exercicios com service role (bypass RLS)
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
          nivel,
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
          message:
            "Vídeo enviado para o Bunny, mas falhou ao salvar o exercício no banco.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        videoId,
        embedUrl,
        exercicio: data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro geral em /api/admin/exercicios/upload:", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno ao processar o upload do exercício.",
      },
      { status: 500 }
    );
  }
}
