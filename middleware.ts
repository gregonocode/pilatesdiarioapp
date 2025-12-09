// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const isAuthRoute = pathname.startsWith("/login");
  const isAppRoute = pathname.startsWith("/aplicativo");

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");

  // Se não for rota que queremos proteger, segue o fluxo normal
  if (!isAuthRoute && !isAppRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const adminEmailEnv = process.env.ADMIN_EMAIL;

  const adminEmail =
    adminEmailEnv?.trim().toLowerCase() ?? null;

  // Criar um cliente Supabase para rodar no middleware (edge)
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      // No middleware a gente não precisa escrever cookies
      set() {
        /* noop */
      },
      remove() {
        /* noop */
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail =
    user?.email?.trim().toLowerCase() ?? null;

  /* ------------------------------------------------------------------
   *  Regras do APP (/login, /aplicativo)
   * ------------------------------------------------------------------ */

  // 🔒 Se NÃO estiver logado e for rota /aplicativo → manda pro /login
  if (!user && isAppRoute) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 🔁 Se estiver logado e for /login → manda pro app
  if (user && isAuthRoute) {
    const redirectUrl = new URL("/aplicativo", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  /* ------------------------------------------------------------------
   *  Regras ADMIN (/admin)
   * ------------------------------------------------------------------ */

  // /admin/login:
  // - sem login → pode acessar pra pedir magic link
  // - logado como admin → redireciona pra /admin/dashboard
  if (isAdminLogin) {
    if (user && adminEmail && userEmail === adminEmail) {
      const redirectUrl = new URL("/admin/dashboard", req.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Qualquer outra rota /admin/*:
  if (isAdminRoute && !isAdminLogin) {
    // se não estiver logado → manda pra /admin/login
    if (!user) {
      const redirectUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // se estiver logado mas NÃO for o admin → manda pro app normal
    if (adminEmail && userEmail !== adminEmail) {
      const redirectUrl = new URL("/aplicativo", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // admin logado → ok
    return NextResponse.next();
  }

  // Caso normal: segue
  return NextResponse.next();
}

// Definir em quais rotas o middleware roda
export const config = {
  matcher: [
    "/login",
    "/aplicativo",
    "/aplicativo/:path*", // protege todas as telas internas do app
    "/admin",
    "/admin/:path*", // protege tudo do admin
  ],
};
