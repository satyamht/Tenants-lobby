"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignUpPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const supabase=createSupabaseBrowserClient();
      const { error }=await supabase.auth.signUp({email,password});
      if(error) throw error;
      setMessage("Account created. Check your email if email confirmation is enabled.");
    } catch(error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally { setLoading(false); }
  }

  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">PROPERTY PLATFORM</p><h1>Create your account</h1>
    <p className="muted">Your account unlocks verified listings and secure conversations.</p>
    <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} /></label>
    <button disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
    {message && <p className="status">{message}</p>}
  </form></main>;
}
