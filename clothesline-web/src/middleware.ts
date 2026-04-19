import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./pages/middleware/withAuth";

function middleware(request: NextRequest) {
  return NextResponse.next();
}

export default withAuth(middleware, ["/homepage"]);

export const config = {
  matcher: ["/homepage"],
};
