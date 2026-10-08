"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, LineChart, LogOut, ShoppingBasket, ShoppingCart, Users, UserCog } from "lucide-react";

const menu = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk & Stok", icon: Package },
  { href: "/admin/members", label: "Member Pelanggan", icon: Users },
  { href: "/admin/users", label: "Akun Pengguna", icon: UserCog },
  { href: "/admin/reports", label: "Laporan Penjualan", icon: LineChart },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="z-30 flex w-full shrink-0 flex-col bg-[#102b25] text-white shadow-lg shadow-emerald-950/5 lg:sticky lg:top-0 lg:h-screen lg:w-[17rem] lg:shadow-none">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-5 lg:px-6 lg:py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#102b25]">
          <ShoppingBasket size={22} />
        </div>
        <div>
          <p className="font-bold leading-tight tracking-tight">ArfaMart</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/50">Panel Admin</p>
        </div>
      </div>

      <nav aria-label="Navigasi admin" className="flex flex-row gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-visible lg:px-4 lg:py-6">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition lg:gap-3 lg:px-3.5 lg:text-sm ${
                active
                  ? "bg-emerald-400 font-semibold text-[#102b25] shadow-lg shadow-black/10"
                  : "text-white/65 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="hidden border-t border-white/[0.08] pt-3 lg:mt-3 lg:block">
          <Link
            href="/kasir"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
          >
            <ShoppingCart size={18} />
            Halaman Kasir
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Admin</p>
          <p className="truncate text-xs font-medium text-white/85">{name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/kasir"
            className="rounded-lg bg-white/[0.07] px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/[0.13] hover:text-white"
          >
            Halaman Kasir
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Keluar"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.07] text-white/75 transition hover:bg-white/[0.13] hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="hidden border-t border-white/[0.08] px-4 py-4 lg:block">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Masuk sebagai</p>
        <p className="mb-3 truncate text-sm font-medium text-white/85">{name}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.07] py-2.5 text-sm transition hover:bg-white/[0.13]"
        >
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  );
}
