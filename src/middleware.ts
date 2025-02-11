// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Remove middleware for now since we'll handle auth checks client-side
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: []
};