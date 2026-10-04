import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase=await createSupabaseServerClient();
  const {data:{claims},error:claimsError}=await supabase.auth.getClaims();
  if(claimsError || !claims?.sub) return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

  const body=await request.json();
  const required=["title","property_type","city","locality"];
  if(required.some(key=>typeof body?.[key]!=="string" || !body[key].trim()))
    return NextResponse.json({error:"INVALID_PROPERTY_INPUT"},{status:400});

  const {data,error}=await supabase.from("properties").insert({
    owner_id:claims.sub,title:body.title.trim(),description:body.description ?? null,
    property_type:body.property_type.trim(),room_type:body.room_type ?? null,
    city:body.city.trim(),locality:body.locality.trim(),
    monthly_rent:Number.isFinite(body.monthly_rent)?body.monthly_rent:null,
    daily_rent:Number.isFinite(body.daily_rent)?body.daily_rent:null,
    weekly_rent:Number.isFinite(body.weekly_rent)?body.weekly_rent:null,
    security_deposit:Number.isFinite(body.security_deposit)?body.security_deposit:null,
    maintenance:Number.isFinite(body.maintenance)?body.maintenance:null,
    verification_status:"PENDING_VERIFICATION"
  }).select("id").single();

  if(error) return NextResponse.json({error:"PROPERTY_CREATE_FAILED"},{status:500});
  return NextResponse.json({propertyId:data.id},{status:201});
}
