import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

// Where the links in Supabase's sign-up and sign-in emails land. Handles both the
// default link (?code=…) and a token_hash link if the email template is customized.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"), "/profiles");
  const supabase = await createClient();

  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing confirmation code") };

  const target = error ? "/login?error=link" : next;
  return NextResponse.redirect(new URL(target, request.url));
}
