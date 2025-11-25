import {NextResponse} from "next/server";

export function middleware(request: Request) {
    const token = request.headers.get("cookie")?.includes("token=");

    const pathname = new URL(request.url).pathname;

    const isAuthRoute = pathname.startsWith("/login");

    if (!token && !isAuthRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Aquí podrías validar roles si los guardas en cookies seguras
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
