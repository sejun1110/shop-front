"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  SpotLight,
  SpotLightIcon,
  SpotLightIconWrap,
} from "@/styled/Component.styles";

type SpotItem = {
  id: number;
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number | null;
  visibleYn?: "Y" | "N";
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

async function apiSpotList(): Promise<SpotItem[]> {
  const res = await fetch(`${API_BASE}/spot-items`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`spot-items failed: ${res.status} ${text}`);
  }

  return await res.json();
}

export default function SpotBanner() {
  const router = useRouter();

  const [list, setList] = useState<SpotItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await apiSpotList();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const visibleSorted = useMemo(() => {
    return list
      .filter((i) => (i.visibleYn ?? "Y") === "Y")
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [list]);

  const go = (url?: string | null) => {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(url);
  };

  if (loading) return null;
  if (visibleSorted.length === 0) return null;

  return (
    <SpotLight>
      <h1>SPOTLIGHT</h1>
      <p>
        혁신적인 기술에 클래식한 실루엣을 더한 나이키 아이템으로
        걸음이 닿는 곳마다 시선을 사로잡아 보세요.
      </p>

      <SpotLightIconWrap>
        {visibleSorted.map((item) => {
          const imgSrc = item.imageUrl
            ? `${API_ROOT}${item.imageUrl}`
            : "/img/air.png";

          return (
            <SpotLightIcon
              key={item.id}
              onClick={() => go(item.linkUrl)}
              style={{ cursor: item.linkUrl ? "pointer" : "default" }}
            >
              <img src={imgSrc} alt={item.title} />
              <h6>{item.title}</h6>
            </SpotLightIcon>
          );
        })}
      </SpotLightIconWrap>
    </SpotLight>
  );
}