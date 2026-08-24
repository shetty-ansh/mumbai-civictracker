import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email?.includes('@'))
    return NextResponse.json(
      { error: 'Enter a valid email.' },
      { status: 400 }
    )

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase
    .from('email_subscribers')
    .insert({ email: email.toLowerCase().trim() })

  if (error?.code === '23505')
    return NextResponse.json(
      { error: "You're already on the list!" },
      { status: 409 }
    )

  if (error)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )

  return NextResponse.json({ success: true })
}