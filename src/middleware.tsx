// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const cookieValue = request.cookies.get("auth-storage")?.value;

//   let token: string | null = null;

//   if (cookieValue) {
//     try {
//       const parsed = JSON.parse(cookieValue);
//       console.log("Parsed cookie:", parsed);
//       token = parsed.state?.token ?? null;
//       console.log("Token:", token);
//     } catch (error) {
//       console.log("Cookie parse error:", error);
//       token = null;
//     }
//   }

//   if (!token) {
//     console.log("No token found, redirecting to login");
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   console.log("Token found, continuing");
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!api/|_next/|favicon.ico|login|signup|not-found|gloval.css|public/).*)",
//   ],
// };
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get("auth-storage")?.value;

  let token: string | null = null;

  if (cookieValue) {
    try {
      const parsed = JSON.parse(cookieValue);
      token = parsed?.state?.token ?? null;
    } catch (error) {
      console.error("Cookie parse error:", error);
      token = null;
    }
  }

  // Хэрэв токен байхгүй бол login руу чиглүүлэх
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Токен байгаа бол үргэлжлүүлэх
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|login|signup|not-found|gloval.css|public/).*)",
  ],
};
