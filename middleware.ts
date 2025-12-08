// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const isAuthRoute = url.pathname.startsWith("/login");
  const isAppRoute = url.pathname.startsWith("/aplicativo");

  // Se não for rota que queremos proteger, segue o fluxo normal
  if (!isAuthRoute && !isAppRoute) {
    return NextResponse.next();
  }

  // Criar um cliente Supabase para rodar no middleware (edge)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        // No middleware a gente não precisa escrever cookies,
        // então deixamos set/remove como no-ops (ou usando o request mesmo).
        set() {
          /* noop */
        },
        remove() {
          /* noop */
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 Se NÃO estiver logado e for rota /aplicativo → manda pro /login
  if (!user && isAppRoute) {
    const redirectUrl = new URL("/login", req.url);

    // opcional: guardar para onde a pessoa queria ir
    redirectUrl.searchParams.set("redirectTo", url.pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // 🔁 Se estiver logado e for /login → manda pro app
  if (user && isAuthRoute) {
    const redirectUrl = new URL("/aplicativo", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Caso normal: segue
  return NextResponse.next();
}

// Definir em quais rotas o middleware roda
export const config = {
  matcher: [
    "/login",
    "/aplicativo",
    "/aplicativo/:path*", // protege todas as telas internas
  ],
};
