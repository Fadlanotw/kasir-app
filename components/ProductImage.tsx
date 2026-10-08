"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ProductImageProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  sizes?: string;
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

export default function ProductImage({
  name,
  imageUrl,
  className = "text-3xl",
  sizes = "100vw",
}: ProductImageProps) {
  const photo = imageUrl || getProductPhoto(name);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  useEffect(() => {
    setFailedPhoto(null);
  }, [photo]);

  if (photo && photo !== failedPhoto) {
    const imageSource = photo.startsWith("/products/") ? `${photo}?v=hd` : photo;

    return (
      <div className="relative h-full w-full">
        <Image
          src={imageSource}
          alt={name}
          fill
          sizes={sizes}
          quality={90}
          className="object-contain p-1"
          onError={() => setFailedPhoto(photo)}
        />
      </div>
    );
  }

  return (
    <span className={`${className} text-center text-gray-400`}>
      Foto belum tersedia
    </span>
  );
}
