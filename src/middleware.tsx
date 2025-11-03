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
  const { pathname } = request.nextUrl;

  // 🧠 Cookie-аас currentExam утгыг авах
  const currentExam = request.cookies.get("currentExam")?.value;

  // 🟢 Хэрвээ хэрэглэгч /exam/[id] руу орж байвал cookie хадгалах
  if (pathname.startsWith("/exam/")) {
    const response = NextResponse.next();
    response.cookies.set("currentExam", pathname, { path: "/" });
    return response;
  }

  // 🔴 Хэрвээ currentExam байгаа үед, өөр хуудас руу оролдох гэж байвал буцаах
  if (currentExam && !pathname.startsWith("/exam")) {
    return NextResponse.redirect(new URL(currentExam, request.url));
  }

  // 🟢 Бусад бүх тохиолдолд үргэлжлүүлэх
  return NextResponse.next();
}

// ⚙️ Middleware аль замуудад ажиллахыг зааж өгнө
export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|login|signup|not-found|global.css|public/).*)",
  ],
};
