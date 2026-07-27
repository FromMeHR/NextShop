import { NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";
import {
  ACCESS_TOKEN_COOKIE,
  SHOW_AUTH_MODAL_COOKIE,
  IS_AUTH_COOKIE,
} from "./constants/constants";

const publicKeyPromise = importSPKI(
  (process.env.JWT_RSA_PUBLIC_KEY || "").replace(/\\n/g, "\n"),
  "RS256"
);

const redirectToAuth = (url) => {
  url.pathname = "/";
  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: SHOW_AUTH_MODAL_COOKIE,
    value: "1",
    path: "/",
    sameSite: "lax",
  });
  return response;
};

export async function proxy(request) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuth = request.cookies.get(IS_AUTH_COOKIE)?.value;
  const url = request.nextUrl.clone();

  if (isAuth !== "1") {
    return redirectToAuth(url);
  }
  if (accessToken) {
    try {
      const publicKey = await publicKeyPromise;
      await jwtVerify(accessToken, publicKey, {
        algorithms: ["RS256"],
      });
    } catch {
      return redirectToAuth(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
