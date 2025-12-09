// src/app/auth/confirm/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextParam = url.searchParams.get("next") ?? "/admin/dashboard";

  // Se vier sem token ou sem type → volta pro login
  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL("/admin/login?error=link_invalido", url.origin)
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // Se for chamado em Server Component, pode ignorar.
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (error) {
    console.error("Erro ao verificar magic link:", error);
    return NextResponse.redirect(
      new URL("/admin/login?error=link_invalido", url.origin)
    );
  }

  // Se deu tudo certo, já tem sessão e cookies setados.
  // Agora redirecionamos pro "next"
  let redirectTo: URL;

  try {
    // Se next for URL absoluta, usa ela; se for caminho relativo, junta com origin
    redirectTo = new URL(nextParam, url.origin);
  } catch {
    redirectTo = new URL("/admin/dashboard", url.origin);
  }

  return NextResponse.redirect(redirectTo);
}
