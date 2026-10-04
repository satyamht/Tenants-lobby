import { NextResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRIVATE_LOCATION_HEADERS } from "@/lib/security";

export async function POST(request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{claims},error}=await supabase.auth.getClaims();
  if(error || !claims?.sub) return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

  const admin=createSupabaseAdminClient();
  const {data:property}=await admin.from("properties").select("owner_id").eq("id",id).maybeSingle();
  if(!property || property.owner_id!==claims.sub)
    return NextResponse.json({error:"FORBIDDEN"},{status:403});

  const body=await request.json();
  const lat=Number(body?.latitude), lon=Number(body?.longitude);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180||typeof body?.exact_address!=="string")
    return NextResponse.json({error:"INVALID_LOCATION"},{status:400});

  const {error:upsertError}=await admin.rpc("set_property_exact_location", {
    p_property_id:id,
    p_latitude:lat,
    p_longitude:lon,
    p_exact_address:body.exact_address.trim(),
    p_gps_accuracy_m:Number.isFinite(body?.gps_accuracy_m)?body.gps_accuracy_m:null,
    p_verification_session_id:typeof body?.verification_session_id==="string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.verification_session_id) ? body.verification_session_id : null
  });
  if(upsertError) return NextResponse.json({error:"LOCATION_SAVE_FAILED"},{status:500});
  return NextResponse.json({ok:true},{headers:PRIVATE_LOCATION_HEADERS});
}

export async function GET() {
  return NextResponse.json(
    {error:"LOCATION_LOCKED",message:"Exact property location requires an authorized unlock."},
    {status:403,headers:PRIVATE_LOCATION_HEADERS}
  );
}
