import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session - IMPORTANT: do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if unauthenticated
  // Note: /calculator and /library are PUBLIC for SEO
  // The authenticated app versions live under /(app)/ route group
  const protectedPaths = [
    "/dashboard",
    "/my-peptides",
    "/schedule",
    "/settings",
    "/history",
    "/onboarding",
  ];

  // Public paths that should NEVER redirect to login
  const publicPaths = [
    "/calculator",
    "/bac-water-calculator",
    "/unit-converter",
    "/library",
    "/peptides",
    "/p/",
    "/embed/",
  ];

  const isPublic = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isProtected = !isPublic && protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/signup", "/forgot-password"];
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
