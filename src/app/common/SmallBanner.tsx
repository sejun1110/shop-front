"use client";

import {useEffect, useState} from "react";
import Carousel from 'react-bootstrap/Carousel';

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`

type BannerItem = {
  id:number; title:string; desc:string; imageUrl:string;
  linkUrl?:string | null; sortOrder?:number | null;
  visibleYn?:"Y"|"N";
}

export default function SmallBanner(){

  const[items, setItems] = useState<BannerItem[]>([])

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_BASE}/banners`, { cache: "no-store" });
      if (!res.ok) throw new Error("배너 로딩 실패");
      const data = await res.json();
      const list: BannerItem[] = Array.isArray(data) ? data : [];

      // visibleYn=Y만 + sortOrder 정렬
      const filtered = list
        .filter((x) => (x.visibleYn ?? "Y") === "Y")
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      setItems(filtered);
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

    useEffect(() => {
    fetchBanners();
  }, []);

  if (items.length === 0) return null;

    return(
<>
<Carousel fade>
      {items.map((b) => {
        const imgSrc = b.imageUrl?.startsWith("http")
          ? b.imageUrl
          : `${API_ROOT}${b.imageUrl}`;

        return (
          <Carousel.Item key={b.id}>
            {/* ✅ 이미지 */}
            <img
              className="d-block w-100"
              src={imgSrc}
              alt={b.title}
              style={{
                height: 260,         // ✅ 원하는 높이
                objectFit: "cover",  // ✅ 비율 유지하며 꽉 채움
              }}
              onClick={() => {
                if (b.linkUrl) window.location.href = b.linkUrl;
              }}
            />

            {/* ✅ 텍스트 */}
            <Carousel.Caption>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </Carousel.Caption>
          </Carousel.Item>
        );
      })}
    </Carousel>
</>
    );

}
/*
 */