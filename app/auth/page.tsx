"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: data.user.email,
          plan: "free",
        },
      ]);
    }

    alert("Account created successfully. You can now sign in.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/app";
  }

  return (
    <main className="min-h-screen bg-[#050812] text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_35%)]" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">
            Career Mode Universe
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            Welcome
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in or create an account
          </p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={signIn}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-4 text-sm font-black text-black transition hover:scale-[1.01] active:scale-[0.99]"
          >
            Sign in
          </button>

          <button
            onClick={signUp}
            className="w-full rounded-2xl border border-orange-400/40 bg-orange-400/10 px-4 py-4 text-sm font-bold text-orange-300 transition hover:bg-orange-400/20 active:scale-[0.99]"
          >
            Create account
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Free users get monthly generation limits. Upgrade later for Pro or
          Ultimate access.
        </p>
      </section>
    </main>
  );
}