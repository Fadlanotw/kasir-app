"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { formatRupiah } from "@/lib/utils";
import Receipt, { ReceiptData } from "@/components/Receipt";
import FakeQr from "@/components/FakeQr";
import ProductImage from "@/components/ProductImage";
import { Search, Plus, Minus, Trash2, ShoppingCart, X, UserCheck, UserX, Banknote, QrCode } from "lucide-react";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { id: number; name: string } | null;
};
type CartItem = { product: Product; qty: number };
type Member = { id: number; name: string; phone: string };
type Category = { id: number; name: string };

export default function KasirPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [payMethod, setPayMethod] = useState<"TUNAI" | "ONLINE">("TUNAI");
  const [onlineType, setOnlineType] = useState<
    "qris" | "gopay" | "shopeepay" | "dana" | "bank_transfer" | "debit_credit"
  >("qris");
  const [simPayment, setSimPayment] = useState<{ code: string; type: string; expiresAt: number } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Hitung mundur masa berlaku kode pembayaran simulasi
  useEffect(() => {
    if (!simPayment) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((simPayment.expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [simPayment]);

  // Member & diskon global (diatur admin, berlaku sama untuk semua member)
  const [memberDiscountPercent, setMemberDiscountPercent] = useState(0);
  const [memberPhone, setMemberPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberError, setMemberError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => setMemberDiscountPercent(s.memberDiscountPercent ?? 0));
  }, []);

  function reloadProducts() {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }

  const filtered = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategory === null || p.category?.id === selectedCategory)
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );
  const discountPercent = member ? memberDiscountPercent : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      if (product.stock < 1) return prev;
      return [...prev, { product, qty: 1 }];
    });
  }

  function changeQty(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== productId) return i;
          const newQty = i.qty + delta;
          if (newQty > i.product.stock) return i;
          return { ...i, qty: newQty };
        })
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  async function handleFindMember() {
    setMemberError("");
    if (!memberPhone.trim()) return;
    setMemberSearching(true);
    const res = await fetch(`/api/members?phone=${encodeURIComponent(memberPhone.trim())}`);
    const data: Member[] = await res.json();
    setMemberSearching(false);

    const exactMatch = data.find((m) => m.phone === memberPhone.trim()) ?? data[0];
    if (!exactMatch) {
      setMemberError("Member tidak ditemukan. Cek kembali nomor HP-nya.");
      setMember(null);
      return;
    }
    setMember(exactMatch);
  }

  function clearMember() {
    setMember(null);
    setMemberPhone("");
    setMemberError("");
  }

  const paid = Number(paidAmount) || 0;
  const change = paid - total;

  function showReceipt(data: any) {
    setReceipt({
      invoiceNo: data.invoiceNo,
      createdAt: data.createdAt,
      cashierName: session?.user?.name ?? "Kasir",
      memberName: data.member?.name ?? null,
      items: data.items.map((it: any) => ({
        productName: it.product.name,
        qty: it.qty,
        price: it.price,
        subtotal: it.subtotal,
      })),
      subtotalAmount: data.subtotalAmount,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      changeAmount: data.changeAmount,
      paymentMethod: data.paymentMethod,
      paymentType: data.paymentType,
    });

    setCart([]);
    setPaidAmount("");
    setPayMethod("TUNAI");
    setSimPayment(null);
    setCheckoutOpen(false);
    clearMember();
    reloadProducts();
  }

  function closeCheckout() {
    setCheckoutOpen(false);
    setSimPayment(null);
    setProcessing(false);
    setError("");
  }

  const cartPayload = () => cart.map((i) => ({ productId: i.product.id, qty: i.qty }));

  // Pembayaran tunai
  async function handleCheckout() {
    setError("");
    if (paid < total) {
      setError("Uang bayar kurang dari total belanja.");
      return;
    }
    setProcessing(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartPayload(),
        paidAmount: paid,
        memberId: member?.id ?? null,
        paymentMethod: "TUNAI",
      }),
    });

    const data = await res.json();
    setProcessing(false);

    if (!res.ok) {
      setError(data.message || "Transaksi gagal");
      return;
    }
    showReceipt(data);
  }

  // ---- Pembayaran online (SIMULASI) ----
  function createSimPayment() {
    setError("");
    const code = `SIM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    setSimPayment({ code, type: onlineType, expiresAt: Date.now() + 5 * 60 * 1000 });
  }

  async function confirmSimPayment() {
    if (!simPayment) return;
    if (secondsLeft <= 0) {
      setError("Kode pembayaran sudah kedaluwarsa. Buat kode baru.");
      return;
    }
    setError("");
    setProcessing(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartPayload(),
        memberId: member?.id ?? null,
        paymentMethod: "ONLINE",
        paymentType: simPayment.type,
        paymentRef: simPayment.code,
      }),
    });
    const data = await res.json();
    setProcessing(false);

    if (!res.ok) {
      setError(data.message || "Transaksi gagal");
      return;
    }
    showReceipt(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-red">Point of sale</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Penjualan</h1>
          <p className="mt-1 text-sm text-gray-500">Pilih barang, masukkan ke keranjang, lalu selesaikan pembayaran.</p>
        </div>
        <div className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm">
          {products.length} produk tersedia
        </div>
      </div>

    <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Daftar produk */}
      <div className="space-y-5 lg:col-span-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk atau scan SKU..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:bg-white"
            autoFocus
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === null
                ? "bg-[#102b25] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === c.id
                  ? "bg-[#102b25] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock < 1}
              className="surface-card group p-3 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 transition group-hover:bg-emerald-100/70 sm:h-28">
                <ProductImage name={p.name} imageUrl={p.imageUrl} />
              </div>
              <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-800">{p.name}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{p.category?.name ?? "-"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-gray-100 pt-2.5">
                <p className="text-xs font-bold text-brand-red sm:text-sm">{formatRupiah(p.price)}</p>
                <p className="text-[10px] font-medium text-gray-400">Stok {p.stock}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10 text-sm">Produk tidak ditemukan.</p>
          )}
        </div>
      </div>

      {/* Keranjang */}
      <div className="surface-card flex h-fit flex-col p-4 sm:p-5 lg:sticky lg:top-24">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-brand-red">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Keranjang</h2>
              <p className="text-[11px] text-gray-400">{cart.length} jenis barang</p>
            </div>
          </div>
        </div>

        {/* Cari member */}
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          {!member ? (
            <>
              <p className="text-xs text-gray-500 mb-1.5">Member? Cari dengan nomor HP</p>
              <div className="flex gap-1.5">
                <input
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFindMember()}
                  placeholder="08xxxxxxxxxx"
                  className="min-w-0 flex-1 border border-gray-200 bg-white px-2.5 py-2 text-sm"
                />
                <button
                  onClick={handleFindMember}
                  disabled={memberSearching}
                  className="primary-action px-3 text-sm disabled:opacity-60"
                >
                  {memberSearching ? "..." : "Cari"}
                </button>
              </div>
              {memberError && <p className="text-xs text-red-500 mt-1">{memberError}</p>}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <UserCheck size={16} className="text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                  <p className="text-xs text-green-600">Diskon member {memberDiscountPercent}%</p>
                </div>
              </div>
              <button onClick={clearMember} className="text-gray-400 hover:text-red-500 shrink-0 p-1">
                <UserX size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[40vh] flex-1 space-y-3 overflow-y-auto pr-1">
          {cart.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
              <ShoppingCart size={22} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Keranjang masih kosong</p>
              <p className="mt-1 text-xs text-gray-400">Pilih barang untuk mulai transaksi.</p>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                <ProductImage name={item.product.name} imageUrl={item.product.imageUrl} className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400">{formatRupiah(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeQty(item.product.id, -1)}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm">{item.qty}</span>
                <button
                  onClick={() => changeQty(item.product.id, 1)}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">{formatRupiah(subtotal)}</span>
          </div>
          {member && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Diskon Member ({discountPercent}%)</span>
              <span className="text-green-600">- {formatRupiah(discountAmount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between rounded-xl bg-emerald-50 px-3 py-3">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="font-bold text-brand-red">{formatRupiah(total)}</span>
          </div>
        </div>

        <button
          onClick={() => setCheckoutOpen(true)}
          disabled={cart.length === 0}
          className="primary-action mt-3 hidden w-full py-3 text-sm lg:block"
        >
          Bayar
        </button>
      </div>
    </div>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(20,48,37,0.10)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-500">Total belanja</p>
              <p className="truncate text-sm font-bold text-brand-red">{formatRupiah(total)}</p>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="primary-action shrink-0 px-6 py-3 text-sm"
            >
              Bayar
            </button>
          </div>
        </div>
      )}

      {/* Modal checkout */}
      {checkoutOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div className="modal-panel w-full max-w-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-800">Pembayaran</h3>
              <button onClick={closeCheckout} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">{formatRupiah(subtotal)}</span>
              </div>
              {member && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Diskon Member ({discountPercent}%)</span>
                  <span className="text-green-600">- {formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total Belanja</span>
                <span className="font-bold text-gray-800">{formatRupiah(total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setPayMethod("TUNAI"); setSimPayment(null); setError(""); }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition ${
                    payMethod === "TUNAI" ? "border-brand-red bg-brand-red text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Banknote size={16} /> Tunai
                </button>
                <button
                  type="button"
                  onClick={() => { setPayMethod("ONLINE"); setError(""); }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition ${
                    payMethod === "ONLINE" ? "border-brand-red bg-brand-red text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <QrCode size={16} /> QRIS / E-Wallet
                </button>
              </div>

              {payMethod === "TUNAI" ? (
                <>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Uang Dibayar</label>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(String(total))}
                    className="text-xs font-medium bg-brand-yellow/30 text-brand-redDark px-2.5 py-1 rounded-md hover:bg-brand-yellow/50"
                  >
                    Uang Pas
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm"
                  autoFocus
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kembalian</span>
                <span className={`font-bold ${change < 0 ? "text-red-500" : "text-green-600"}`}>
                  {formatRupiah(Math.max(change, 0))}
                </span>
              </div>
                </>
              ) : (
                <div className="space-y-3">
                  {!simPayment ? (
                    <>
                      <p className="text-xs text-gray-500">Pilih metode pembayaran pelanggan:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          ["qris", "QRIS"],
                          ["gopay", "GoPay"],
                          ["shopeepay", "ShopeePay"],
                          ["dana", "DANA"],
                          ["bank_transfer", "Transfer Bank"],
                          ["debit_credit", "Kartu Debit/Kredit"],
                        ] as const).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setOnlineType(value)}
                            className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition sm:text-sm ${
                              onlineType === value
                                ? "border-brand-red bg-emerald-50 text-brand-redDark font-semibold ring-1 ring-brand-red/20"
                                : "border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-gray-200 p-4 text-center space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-redDark">
                        {simPayment.type === "qris"
                          ? "QRIS"
                          : simPayment.type === "gopay"
                            ? "GoPay"
                            : simPayment.type === "shopeepay"
                              ? "ShopeePay"
                              : simPayment.type === "dana"
                                ? "DANA"
                                : simPayment.type === "bank_transfer"
                                  ? "Transfer Bank"
                                  : "Kartu Debit/Kredit"}{" "}
                        &middot; Mode Simulasi
                      </p>
                      {simPayment.type === "qris" ||
                      simPayment.type === "gopay" ||
                      simPayment.type === "shopeepay" ||
                      simPayment.type === "dana" ? (
                        <>
                          <div className="flex justify-center">
                            <div className={secondsLeft <= 0 ? "opacity-30" : ""}>
                              <FakeQr seed={simPayment.code} />
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            QR ini hanya simulasi, tidak bisa discan, dan tidak memproses pembayaran sungguhan.
                          </p>
                        </>
                      ) : (
                        <div className="rounded-xl bg-gray-50 px-3 py-4">
                          <p className="text-xs text-gray-500">
                            {simPayment.type === "bank_transfer"
                              ? "Nomor referensi transfer simulasi"
                              : "Referensi transaksi kartu simulasi"}
                          </p>
                          <p className="mt-1 break-all font-mono text-sm font-bold text-gray-800">{simPayment.code}</p>
                          <p className="mt-2 text-[11px] leading-4 text-gray-400">
                            {simPayment.type === "bank_transfer"
                              ? "Jangan lakukan transfer sungguhan. Pembayaran ini hanya untuk simulasi."
                              : "Tidak ada data kartu yang diminta dan tidak ada pembayaran sungguhan."}
                          </p>
                        </div>
                      )}
                      <p className="font-bold text-gray-800">{formatRupiah(total)}</p>
                      {(simPayment.type === "qris" ||
                        simPayment.type === "gopay" ||
                        simPayment.type === "shopeepay" ||
                        simPayment.type === "dana") && (
                        <p className="break-all text-[11px] text-gray-400">{simPayment.code}</p>
                      )}
                      <p className={`text-sm font-medium ${secondsLeft <= 0 ? "text-red-500" : "text-gray-600"}`}>
                        {secondsLeft <= 0
                          ? "Kode kedaluwarsa"
                          : `Berlaku ${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`}
                      </p>
                      <p className="text-[11px] text-gray-400">QR ini hanya simulasi dan tidak bisa discan. Tidak ada uang sungguhan.</p>
                    </div>
                  )}
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {payMethod === "TUNAI" ? (
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="primary-action w-full py-3 text-sm"
                >
                  {processing ? "Memproses..." : "Selesaikan Transaksi"}
                </button>
              ) : !simPayment ? (
                <button
                  onClick={createSimPayment}
                  className="primary-action w-full py-3 text-sm"
                >
                  Buat Kode Pembayaran
                </button>
              ) : secondsLeft <= 0 ? (
                <button
                  onClick={createSimPayment}
                  className="primary-action w-full py-3 text-sm"
                >
                  Buat Kode Baru
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={confirmSimPayment}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm"
                  >
                    {processing ? "Memproses..." : "Simulasikan: Pelanggan Sudah Bayar"}
                  </button>
                  <button
                    onClick={() => { setSimPayment(null); setError(""); }}
                    disabled={processing}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    Batalkan pembayaran
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal struk setelah transaksi berhasil */}
      {receipt && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div className="modal-panel w-full max-w-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-800">Transaksi Berhasil</h3>
              <button onClick={() => setReceipt(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <Receipt data={receipt} />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setReceipt(null)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="primary-action flex-1 py-2 text-sm"
                >
                  Cetak Struk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
