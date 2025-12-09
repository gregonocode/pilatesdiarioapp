// src/app/api/upload-bunny/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY as string;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID as string;

interface BunnyApiResponse {
  success: boolean;
  message: string;
  guid?: string;
  tusEndpoint?: string;
  signature?: string;
  expire?: number;
  libraryId?: string;
  videoUrl?: string;
  embedUrl?: string;
  details?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<BunnyApiResponse>> {
  try {
    const body = await req.json();
    const title = body.titulo as string | undefined;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Título é obrigatório" },
        { status: 400 }
      );
    }

    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Variáveis BUNNY_API_KEY e BUNNY_LIBRARY_ID não configuradas.",
        },
        { status: 500 }
      );
    }

    // 1) Criar vídeo no Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: BUNNY_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!createRes.ok) {
      const details = await createRes.text();
      console.error("Falha ao criar vídeo no Bunny:", details);
      return NextResponse.json(
        { success: false, message: "Falha ao criar vídeo", details },
        { status: createRes.status }
      );
    }

    const { guid } = (await createRes.json()) as { guid?: string };

    if (!guid) {
      return NextResponse.json(
        {
          success: false,
          message: "Bunny não retornou GUID do vídeo.",
        },
        { status: 500 }
      );
    }

    // 2) Assinatura TUS
    const expire = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 dias
    const toSign = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expire}${guid}`;
    const signature = crypto
      .createHash("sha256")
      .update(toSign)
      .digest("hex");

    const videoUrl = `https://vz-${guid}.b-cdn.net`;
    const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${guid}`;

    return NextResponse.json({
      success: true,
      message: "Pronto para upload via TUS",
      tusEndpoint: "https://video.bunnycdn.com/tusupload",
      signature,
      expire,
      libraryId: BUNNY_LIBRARY_ID,
      guid,
      videoUrl,
      embedUrl,
    });
  } catch (error) {
    console.error("Erro inesperado no handler POST de /api/upload-bunny:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
