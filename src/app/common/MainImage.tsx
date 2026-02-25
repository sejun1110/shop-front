"use client";

import { useEffect, useState } from "react";

type MainBanner = {
  id: number;
  imageUrl: string;
  linkUrl?: string | null;
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

export default function MainImage() {
  const [banner, setBanner] = useState<MainBanner | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_BASE}/main-banner`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setBanner(null);
          return;
        }

        const data: MainBanner | null = await res.json().catch(() => null);
        setBanner(data);
      } catch (err) {
        console.error("main-banner load error", err);
        setBanner(null);
      }
    };

    fetchBanner();
  }, []);

  const imageSrc = banner?.imageUrl ? `${API_ROOT}${banner.imageUrl}` : "/img/banner.png";

  return (
    <>
      {banner?.linkUrl ? (
        <a href={banner.linkUrl} target="_blank" rel="noreferrer">
          <img src={imageSrc} className="w-100" alt="main-banner" />
        </a>
      ) : (
        <img src={imageSrc} className="w-100" alt="main-banner" />
      )}
    </>
  );
}