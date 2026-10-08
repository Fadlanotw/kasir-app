"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBasket, Lock, User, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Username atau password salah.");
      return;
    }

    // Ambil session untuk cek role lalu redirect
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/kasir");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-10">
      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl overflow-hidden rounded-2xl border border-emerald-950/[0.06] bg-white shadow-[0_30px_90px_rgba(20,48,37,0.14)] sm:rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#102b25] p-12 text-white lg:flex">
          <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-8 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-[#102b25] shadow-lg shadow-emerald-950/20">
              <ShoppingBasket size={25} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">ArfaMart</p>
              <p className="text-xs text-emerald-100/60">Retail management</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-5xl font-semibold leading-[1.08] tracking-tight">
              Semua urusan toko, <span className="text-emerald-300">dalam satu tempat.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-emerald-100/65">
              Pantau produk, transaksi, dan pelanggan dengan pengalaman kasir yang lebih sederhana.
            </p>

            <div className="mt-10 flex justify-center">
              <div className="login-3d-scene" aria-hidden="true">
                <div className="login-3d-orbit login-3d-orbit-one" />
                <div className="login-3d-orbit login-3d-orbit-two" />
                <div className="login-3d-grid" />
                <div className="login-3d-backdrop" />

                <div className="login-3d-card login-3d-panel">
                  <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-emerald-100/70">
                    <span>Dashboard</span>
                    <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2 py-1 text-[9px] font-medium text-emerald-200">
                      Live
                    </span>
                  </div>
                  <div className="mb-3 flex items-end gap-2">
                    <div className="login-3d-bar" style={{ height: "30%" }} />
                    <div className="login-3d-bar" style={{ height: "52%" }} />
                    <div className="login-3d-bar" style={{ height: "68%" }} />
                    <div className="login-3d-bar" style={{ height: "86%" }} />
                    <div className="login-3d-bar" style={{ height: "74%" }} />
                    <div className="login-3d-bar" style={{ height: "96%" }} />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs text-emerald-50/80">
                    <span>101 transaksi</span>
                    <span className="font-semibold text-emerald-300">+34.8%</span>
                  </div>
                </div>

                <div className="login-3d-card login-3d-glow-card">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-emerald-100/65">Profit</span>
                  <strong className="mt-2 block text-xl font-bold text-white">Rp 18.2K</strong>
                </div>

                <div className="login-3d-receipt">
                  <span className="login-3d-receipt-logo">ARFA MART</span>
                  <span className="login-3d-receipt-line" />
                  <span className="login-3d-receipt-line login-3d-receipt-line-short" />
                  <span className="login-3d-receipt-total" />
                </div>

                <div className="login-3d-counter">
                  <div className="login-3d-counter-top" />
                  <div className="login-3d-counter-front" />
                  <div className="login-3d-counter-side" />
                </div>

                <div className="login-3d-shopping-bag">
                  <span className="login-3d-bag-handle" />
                  <span className="login-3d-bag-logo">ARFA<br />MART</span>
                </div>

                <div className="login-3d-product-card">
                  <span className="login-3d-product-badge">PILIHAN TOKO</span>
                  <div className="login-3d-product-photo">
                    <Image
                      src="/products/milk-carton.svg"
                      alt="Kemasan susu UHT full cream 1 liter"
                      width={240}
                      height={300}
                      priority
                    />
                  </div>
                  <div className="login-3d-product-info">
                    <strong>Ultra Milk Full Cream</strong>
                    <span>Susu UHT · 1.000 ml</span>
                    <div className="login-3d-product-footer">
                      <span>Produk minimarket</span>
                      <span className="login-3d-cart-icon"><ShoppingBasket size={13} /></span>
                    </div>
                  </div>
                </div>

                <div className="login-3d-terminal">
                  <div className="login-3d-terminal-screen">
                    <span>ARFAMART POS</span>
                    <strong>Rp 24.800</strong>
                    <small>TRANSAKSI BERHASIL</small>
                  </div>
                  <div className="login-3d-terminal-keypad">
                    <i /><i /><i />
                    <i /><i /><i />
                    <i /><i /><i />
                  </div>
                </div>

                <div className="login-3d-chip">
                  <span className="login-3d-chip-dot" />
                  <span>POS AKTIF</span>
                </div>

                <div className="login-3d-stat">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/70">Sales</span>
                  <strong className="mt-2 block text-2xl font-bold text-white">Rp 24.8K</strong>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-emerald-100/40">ArfaMart · Sistem Kasir Minimarket</p>
        </section>

        <section className="flex items-center justify-center px-5 py-9 sm:px-12 sm:py-12">
          <div className="w-full max-w-sm">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-brand-red">
                <ShoppingBasket size={23} />
              </div>
              <div>
                <p className="font-bold text-gray-900">ArfaMart</p>
                <p className="text-xs text-gray-500">Sistem Kasir Minimarket</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-brand-red">Selamat datang kembali</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Masuk ke akun</h1>
              <p className="mt-2 text-sm text-gray-500">Masukkan akun untuk melanjutkan ke dashboard toko.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <div className="relative mt-2">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-3 pl-11 pr-3 text-sm focus:bg-white"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative mt-2">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-3 pl-11 pr-3 text-sm focus:bg-white"
                    placeholder="Masukkan password"
                  />
                </div>
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="primary-action flex w-full items-center justify-center gap-2 py-3 text-sm"
              >
                {loading ? "Memproses..." : "Masuk ke dashboard"}
                {!loading && <ArrowUpRight size={17} />}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={15} className="text-brand-red" /> Login aman untuk admin dan kasir
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
