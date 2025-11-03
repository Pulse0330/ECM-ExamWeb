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

  // Шалгалт дууссан эсэх cookie
  const examFinished = request.cookies.get("examFinished")?.value === "true";

  // /exam/[id] руу орох үед cookie-г зөвхөн шалгалт дуусаагүй үед хадгалах
  // if (pathname.startsWith("/exam/") && !examFinished) {
  //   const response = NextResponse.next();
  //   response.cookies.set("currentExam", pathname, { path: "/" });
  //   response.cookies.set("examFinished", "false", { path: "/" }); // Шинэ шалгалт эхэллээ
  //   return response;
  // }

  // const currentExam = request.cookies.get("currentExam")?.value;

  // // Шалгалт дуусаагүй байхад л redirect хийх
  // if (currentExam && !examFinished && !pathname.startsWith("/exam")) {
  //   return NextResponse.redirect(new URL(currentExam, request.url));
  // }

  // Бусад бүх тохиолдолд үргэлжлүүлэх
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|login|signup|not-found|global.css|public/).*)",
  ],
};
