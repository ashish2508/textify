export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*", "/api/conversations/:path*", "/api/messages/:path*", "/api/translate/:path*", "/api/settings/:path*"],
};
