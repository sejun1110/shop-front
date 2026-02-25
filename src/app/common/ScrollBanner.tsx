"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ScrollWrap, ImgWrap, ImgTextWrap } from "@/styled/Component.styles"
import { WhiteBtn } from "@/styled/Button.styles"

type ScrollBannerItem = {
id:number; title:string; 
imageUrl?:string | null; 
linkUrl?:string | null; 
// 버튼 텍스트/링크(선택)
  buttonText?: string | null;
  buttonLinkUrl?: string | null;
sortOrder?: number | null;
  visibleYn?: "Y" | "N";
}

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

async function apiScrollBannerList(): Promise<ScrollBannerItem[]> {
  const res = await fetch(`${API_BASE}/scroll-banners`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`scroll-banners failed: ${res.status} ${text}`);
  }
  return await res.json();
}

export default function ScrollBanner(){

    const router = useRouter();

  const [list, setList] = useState<ScrollBannerItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await apiScrollBannerList();
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

   // ✅ 노출(Y)만 + 정렬
  const visibleSorted = useMemo(() => {
    return list
      .filter((b) => (b.visibleYn ?? "Y") === "Y")
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [list]);

  // ✅ 링크 이동 헬퍼(외부/내부 분기)
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

    return(
        <>
        <h1 className="my-3">Trending Now</h1>

      <ScrollWrap>
        {visibleSorted.map((b) => {
          const imgSrc = b.imageUrl ? `${API_ROOT}${b.imageUrl}` : null;
          const btnText = (b.buttonText ?? "").trim() || "구매하기";

          return (
            <ImgWrap
              key={b.id}
              role={b.linkUrl ? "button" : undefined}
              onClick={() => go(b.linkUrl)}
              style={{ cursor: b.linkUrl ? "pointer" : "default" }}
            >
              {imgSrc ? (
                <img src={imgSrc} alt={b.title} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    background: "#f3f3f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    opacity: 0.7,
                  }}
                >
                  no image
                </div>
              )}

              <ImgTextWrap>
                <h2>{b.title}</h2>

                <WhiteBtn
                  onClick={(e) => {
                    // ✅ 카드 클릭과 버튼 클릭이 같이 실행되지 않게 막기
                    e.stopPropagation();
                    // 버튼 링크가 있으면 버튼 링크 우선, 없으면 카드 링크 사용
                    go(b.buttonLinkUrl ?? b.linkUrl);
                  }}
                >
                  {btnText}
                </WhiteBtn>
              </ImgTextWrap>
            </ImgWrap>
          );
        })}
      </ScrollWrap>
        </>
    )
}