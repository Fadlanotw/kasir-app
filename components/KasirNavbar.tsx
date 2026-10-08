"use client";

import { signOut } from "next-auth/react";
import { ShoppingBasket, LogOut, LayoutDashboard, CircleUserRound } from "lucide-react";
import Link from "next/link";

export default function KasirNavbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-emerald-950/[0.06] bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-brand-red">
            <ShoppingBasket size={22} />
          </div>
          <div>
            <span className="block font-bold tracking-tight text-gray-900">ArfaMart</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 sm:block">Point of sale</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-gray-50 py-1.5 pl-2 pr-3 sm:flex">
            <CircleUserRound size={18} className="text-brand-red" />
            <span className="max-w-40 truncate text-xs font-medium text-gray-600">{name}</span>
          </div>
        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-brand-red min-[380px]:px-3 sm:text-sm"
          >
            <LayoutDashboard size={15} /> <span className="hidden min-[380px]:inline">Panel Admin</span>
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 min-[380px]:px-3 sm:text-sm"
        >
          <LogOut size={15} /> <span className="hidden min-[380px]:inline">Keluar</span>
        </button>
        </div>
      </div>
    </header>
  );
}
