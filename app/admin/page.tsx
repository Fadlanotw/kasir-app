"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import SalesChart from "@/components/SalesChart";
import { Wallet, Receipt, Package, AlertTriangle } from "lucide-react";

type Summary = {
  todayRevenue: number;
  todayTransactionCount: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockProducts: { id: number; name: string; stock: number; minStock: number }[];
  chartData: { date: string; total: number }[];
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((r) => r.json())
      .then(setSummary);
  }, []);

  const cards = summary
    ? [
        { label: "Pendapatan Hari Ini", value: formatRupiah(summary.todayRevenue), icon: Wallet, color: "bg-green-500" },
        { label: "Transaksi Hari Ini", value: summary.todayTransactionCount, icon: Receipt, color: "bg-brand-red" },
        { label: "Total Produk", value: summary.totalProducts, icon: Package, color: "bg-brand-yellow" },
        { label: "Stok Menipis", value: summary.lowStockCount, icon: AlertTriangle, color: "bg-red-500" },
      ]
    : [];

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-red">Ringkasan toko</p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Pantau performa dan aktivitas tokomu hari ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="surface-card flex items-center gap-4 p-5">
            <div className={`${c.color} rounded-2xl p-3 text-white shadow-sm`}>
              <c.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-800">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="surface-card p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Penjualan 7 Hari Terakhir</h2>
        {summary ? <SalesChart data={summary.chartData} /> : <p className="text-sm text-gray-400">Memuat...</p>}
      </div>

      {summary && summary.lowStockProducts.length > 0 && (
        <div className="surface-card p-5 sm:p-6">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" /> Stok Menipis
          </h2>
          <ul className="divide-y divide-gray-100">
            {summary.lowStockProducts.map((p) => (
              <li key={p.id} className="py-2 flex justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="text-red-600 font-medium">Sisa {p.stock}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
