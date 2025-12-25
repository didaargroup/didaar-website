import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones starting with `/admin` (excluded from internationalization)
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|admin|.*\\..*).*)'
};


// In your middleware
// export async function middleware(request: NextRequest) {
//   const session = await getSession(request);
  
//   // Simple boolean check - no complex logic
//   if (!session && request.nextUrl.pathname.startsWith('/admin')) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
  
//   // Then apply next-intl middleware
//   return createMiddleware(routing)(request);
// }