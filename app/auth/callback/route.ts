import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Store user in a way that client can access
      const response = NextResponse.redirect(requestUrl.origin)
      response.cookies.set('nexia_user', JSON.stringify(data.user), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      return response
    }
  }

  return NextResponse.redirect(requestUrl.origin)
}