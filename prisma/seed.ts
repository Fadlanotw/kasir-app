import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Password disimpan apa adanya (tanpa hashing) sesuai kebutuhan tugas.
  const adminPassword = "admin123";
  const kasirPassword = "kasir123";

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminPassword },
    create: { name: "Admin Toko", username: "admin", password: adminPassword, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { username: "kasir" },
    update: { password: kasirPassword },
    create: { name: "Kasir 1", username: "kasir", password: kasirPassword, role: "KASIR" },
  });

  const minuman = await prisma.category.upsert({ where: { name: "Minuman" }, update: {}, create: { name: "Minuman" } });
  const makanan = await prisma.category.upsert({ where: { name: "Makanan Ringan" }, update: {}, create: { name: "Makanan Ringan" } });
  const sembako = await prisma.category.upsert({ where: { name: "Sembako" }, update: {}, create: { name: "Sembako" } });

  const products = [
    { name: "Aqua Botol 600ml", sku: "MNM001", price: 4000, stock: 100, categoryId: minuman.id },
    { name: "Teh Pucuk 350ml", sku: "MNM002", price: 5000, stock: 80, categoryId: minuman.id },
    { name: "Kopi Kapal Api Sachet", sku: "MNM003", price: 1500, stock: 150, categoryId: minuman.id },
    { name: "Chitato 68g", sku: "MKN001", price: 10500, stock: 50, categoryId: makanan.id },
    { name: "Indomie Goreng", sku: "MKN002", price: 3000, stock: 200, categoryId: makanan.id },
    { name: "Oreo Original", sku: "MKN003", price: 8500, stock: 60, categoryId: makanan.id },
    { name: "Beras 5kg", sku: "SMB001", price: 65000, stock: 30, categoryId: sembako.id },
    { name: "Minyak Goreng 1L", sku: "SMB002", price: 18000, stock: 40, categoryId: sembako.id },
    { name: "Gula Pasir 1kg", sku: "SMB003", price: 16000, stock: 45, categoryId: sembako.id },
    { name: "Ultra Milk Full Cream 1L", sku: "MNM004", price: 21000, stock: 40, categoryId: minuman.id, imageUrl: "/products/ultra-milk.jpg" },
    { name: "Beng-Beng Extra Chocolate & Caramel", sku: "MKN004", price: 2500, stock: 100, categoryId: makanan.id, imageUrl: "/products/beng-beng.jpg" },
    { name: "Nabati Wafer Richeese", sku: "MKN005", price: 2000, stock: 100, categoryId: makanan.id, imageUrl: "/products/nabati-richeese.jpg" },
    { name: "Chocolatos Wafer Keju", sku: "MKN006", price: 2000, stock: 100, categoryId: makanan.id, imageUrl: "/products/chocolatos.jpg" },
    { name: "Biskitop Vegetable & Cheese Stick", sku: "MKN007", price: 7000, stock: 40, categoryId: makanan.id, imageUrl: "/products/vegetable-stick.jpg" },
    { name: "Nabati Wafer Richoco", sku: "MKN008", price: 2000, stock: 100, categoryId: makanan.id, imageUrl: "/products/richoco-wafer.jpg" },
    { name: "Nextar Brownies Choco Delight", sku: "MKN009", price: 8000, stock: 50, categoryId: makanan.id, imageUrl: "/products/nextar-brownies.jpg" },
    { name: "Roma Sandwich Cokelat Bon Bon", sku: "MKN010", price: 7000, stock: 50, categoryId: makanan.id, imageUrl: "/products/roma-bonbon.jpg" },
    { name: "Superco Biskuit", sku: "MKN011", price: 1500, stock: 80, categoryId: makanan.id, imageUrl: "/products/superco.jpg" },
    { name: "Nissin Crispy Crackers 250g", sku: "MKN012", price: 12000, stock: 30, categoryId: makanan.id, imageUrl: "/products/nissin-crackers.jpg" },
    { name: "Roma Sari Gandum Sandwich", sku: "MKN013", price: 8000, stock: 40, categoryId: makanan.id, imageUrl: "/products/sari-gandum.jpg" },
    { name: "Nextar Nastar Stroberi", sku: "MKN014", price: 9000, stock: 40, categoryId: makanan.id, imageUrl: "/products/nextar-strawberry.jpg" },
    { name: "Khong Guan Assorted Biscuits", sku: "MKN015", price: 85000, stock: 15, categoryId: makanan.id, imageUrl: "/products/khong-guan.jpg" },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p });
  }

  console.log("Seed selesai. Login: admin/admin123 atau kasir/kasir123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
