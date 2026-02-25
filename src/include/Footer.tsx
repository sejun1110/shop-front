"use client";

import { useEffect, useMemo, useState } from "react";
import { FooterMenu, FooterWrap } from "@/styled/Component.styles";

type Category = { id: number; title: string; sortOrder?: number|null; visibleYn?: "Y"|"N" };
type LinkItem = { id: number; categoryId: number; label: string; url: string; sortOrder?: number|null; visibleYn?: "Y"|"N" };
type FooterText = { id: number; paragraph1: string; paragraph2: string };

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

export default function Footer() {
  const [cats, setCats] = useState<Category[]>([]);
  const [linksMap, setLinksMap] = useState<Record<number, LinkItem[]>>({});
  const [text, setText] = useState<FooterText | null>(null);

  const load = async () => {
    const cRes = await fetch(`${API_BASE}/footer/categories`, { cache: "no-store" });
    const cData = await cRes.json().catch(() => []);
    const categories: Category[] = Array.isArray(cData) ? cData : [];
    setCats(categories);

    // 각 카테고리별 링크 조회
    const map: Record<number, LinkItem[]> = {};
    for (const c of categories) {
      const r = await fetch(`${API_BASE}/footer/categories/${c.id}/links`, { cache: "no-store" });
      const d = await r.json().catch(() => []);
      map[c.id] = (Array.isArray(d) ? d : []);
    }
    setLinksMap(map);

    const tRes = await fetch(`${API_BASE}/footer/text`, { cache: "no-store" });
    const tData = await tRes.json().catch(() => null);
    setText(tData);
  };

  useEffect(() => { load(); }, []);

  const visibleCats = useMemo(
    () => cats.filter(c => (c.visibleYn ?? "Y") === "Y"),
    [cats]
  );

  return (
    <>
      <FooterWrap>
        {visibleCats.map((c) => {
          const links = (linksMap[c.id] ?? []).filter(l => (l.visibleYn ?? "Y") === "Y");
          return (
            <FooterMenu key={c.id}>
              <h6>{c.title}</h6>
              {links.map((l) => (
                <span key={l.id}>
                  <a href={l.url}>{l.label}</a>
                  <br />
                </span>
              ))}
            </FooterMenu>
          );
        })}
      </FooterWrap>

      <FooterWrap>
        <p>{text?.paragraph1 ?? ""}</p>
        <p>{text?.paragraph2 ?? ""}</p>
      </FooterWrap>
    </>
  );
}