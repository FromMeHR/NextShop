import { NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";

const publicKeyPromise = importSPKI(
  (process.env.JWT_RSA_PUBLIC_KEY || "").replace(/\\n/g, "\n"),
  "RS256"
);

export async function proxy(request) {
  const accessToken = request.cookies.get("access_token")?.value;
  const isAuth = request.cookies.get("isAuth")?.value;
  const url = request.nextUrl.clone();

  if (isAuth !== "1") {
    url.pathname = "/";
    url.searchParams.set("showAuthModal", "1");
    return NextResponse.redirect(url);
  }
  if (accessToken) {
    try {
      const publicKey = await publicKeyPromise;
      await jwtVerify(accessToken, publicKey, {
        algorithms: ["RS256"],
      });
    } catch {
      url.pathname = "/";
      url.searchParams.set("showAuthModal", "1");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
