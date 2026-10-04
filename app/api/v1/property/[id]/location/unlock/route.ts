import { NextResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRIVATE_LOCATION_HEADERS } from "@/lib/security";

export async function POST(request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{claims},error}=await supabase.auth.getClaims();
  if(error || !claims?.sub)
    return NextResponse.json({error:"UNAUTHORIZED"},{status:401,headers:PRIVATE_LOCATION_HEADERS});

  let paymentReference:string|null=null;
  try {
    const body=await request.json();
    paymentReference=typeof body?.payment_reference==="string"?body.payment_reference:null;
  } catch {}

  const admin=createSupabaseAdminClient();
  const {data,error:unlockError}=await admin.rpc("unlock_property_location",{
    p_user_id:claims.sub,
    p_property_id:id,
    p_authorization_method:"wallet_credit",
    p_payment_reference:paymentReference
  });

  if(unlockError) {
    const message=unlockError.message;
    const status=message.includes("INSUFFICIENT_CREDITS")?402:
      message.includes("PROPERTY_NOT_ELIGIBLE")?409:
      message.includes("LOCATION_NOT_AVAILABLE")?404:403;
    return NextResponse.json({error:message.split(":")[0]},{status,headers:PRIVATE_LOCATION_HEADERS});
  }

  return NextResponse.json({data},{headers:PRIVATE_LOCATION_HEADERS});
}
