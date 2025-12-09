// src/app/api/admin/verify-code/route.ts
import { NextRequest, NextResponse } from "next/server";

type VerifyResponse =
  | { ok: true }
  | { ok: false; message?: string };

type Body = {
  code?: string;
};

export async function POST(req: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    const body = (await req.json()) as Body;
    const code = (body.code || "").trim();

    const expectedCode = process.env.ADMIN_SECURITY_CODE;

    if (!expectedCode) {
      console.error(
        "ADMIN_SECURITY_CODE não definido no ambiente. Configure no .env.local"
      );
      return NextResponse.json(
        { ok: false, message: "Configuração interna ausente." },
        { status: 500 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Código não informado." },
        { status: 400 }
      );
    }

    if (code !== expectedCode) {
      return NextResponse.json(
        { ok: false, message: "Código inválido." },
        { status: 401 }
      );
    }

    // Tudo certo 🎉
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Erro em /api/admin/verify-code:", err);
    return NextResponse.json(
      { ok: false, message: "Erro interno ao validar o código." },
      { status: 500 }
    );
  }
}
