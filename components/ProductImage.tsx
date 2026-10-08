type ProductImageProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

function getProductPhoto(name: string): string | null {
  const productName = name.toLowerCase();

  if (/aqua|air mineral|air putih|water/.test(productName)) return "/products/water.jpg";
  if (/teh|tea/.test(productName)) return "/products/tea.jpg";
  if (/kopi|coffee/.test(productName)) return "/products/coffee.jpg";
  if (/chitato|keripik|chips/.test(productName)) return "/products/chips.jpg";
  if (/indomie|mi instan|mie instan|noodle/.test(productName)) return "/products/noodles.jpg";
  if (/oreo|biskuit|biscuit|cookie/.test(productName)) return "/products/cookies.jpg";
  if (/beras|rice/.test(productName)) return "/products/rice.jpg";
  if (/minyak|oil/.test(productName)) return "/products/oil.jpg";
  if (/gula|sugar/.test(productName)) return "/products/sugar.jpg";

  return null;
}

export default function ProductImage({ name, imageUrl, className = "text-3xl" }: ProductImageProps) {
  const photo = imageUrl || getProductPhoto(name);

  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} className="w-full h-full object-cover" />;
  }

  return (
    <span className={`${className} text-center text-gray-400`}>
      Foto belum tersedia
    </span>
  );
}
