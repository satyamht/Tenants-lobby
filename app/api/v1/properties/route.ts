import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url=new URL(request.url);
  const city=url.searchParams.get("city");
  const locality=url.searchParams.get("locality");
  const maxRent=url.searchParams.get("maxRent");

  const supabase=await createSupabaseServerClient();
  let query=supabase.from("property_search").select("*").order("created_at",{ascending:false});
  if(city) query=query.eq("city",city);
  if(locality) query=query.eq("locality",locality);
  if(maxRent) query=query.lte("monthly_rent",Number(maxRent));

  const {data,error}=await query.limit(50);
  if(error) return NextResponse.json({error:"PROPERTY_SEARCH_FAILED"},{status:500});
  return NextResponse.json({data});
}
