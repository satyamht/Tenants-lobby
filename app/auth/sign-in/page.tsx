"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const supabase=createSupabaseBrowserClient();
      const { error }=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      window.location.href="/";
    } catch(error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally { setLoading(false); }
  }
  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">PROPERTY PLATFORM</p><h1>Welcome back</h1>
    <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>
    <button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    {message && <p className="status">{message}</p>}
  </form></main>;
}
