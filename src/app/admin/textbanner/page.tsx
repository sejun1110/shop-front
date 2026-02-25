"use client";

import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

import Header from "@/include/Header";
import SideBar from "../include/SideBar";

import {
  PageWrapper,
  MainContentWrapper,
  Content,
  H1,
  H5,
  ContentInner,
  P,
} from "@/styled/Admin.styles";

/**
 * ✅ 배너 관리 (TEXTBanner 연동용)
 *
 * API (Spring)
 * - GET    /api/banners
 * - POST   /api/banners        (multipart/form-data)  ※ image 선택이면 업로드, 없어도 등록 가능(선택사항)
 * - DELETE /api/banners/{id}
 *
 * TEXTBanner에서 사용 필드:
 * - title, desc, linkUrl, sortOrder, visibleYn
 */

type BannerItem = {
  id: number;
  title: string;
  desc: string;
  imageUrl?: string;
  linkUrl?: string | null;
  sortOrder?: number | null;
  visibleYn?: "Y" | "N";
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

// -------------------------
// ✅ API helpers
// -------------------------
async function apiBannerList(): Promise<BannerItem[]> {
  const res = await fetch(`${API_BASE}/text-banners`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`banners failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiBannerCreate(payload: {
  title: string;
  desc: string;
  linkUrl?: string;
  sortOrder?: number;
  visibleYn?: "Y" | "N";
  imageFile?: File | null; // ✅ 선택
}): Promise<any> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("desc", payload.desc);
  fd.append("visibleYn", payload.visibleYn ?? "Y");
  if (payload.linkUrl != null) fd.append("linkUrl", payload.linkUrl);
  if (payload.sortOrder != null) fd.append("sortOrder", String(payload.sortOrder));
  if (payload.imageFile) fd.append("image", payload.imageFile); // ✅ 선택

  const res = await fetch(`${API_BASE}/text-banners`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`banner create failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiBannerDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/text-banners/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`banner delete failed: ${res.status} ${text}`);
  }
}

// -------------------------
// ✅ Page Component
// -------------------------
export default function BannerAdminPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 입력 폼
  const [title, setTitle] = useState("나이키스킴스 2026");
  const [desc, setDesc] = useState("출시알림을 설정하고");
  const [linkUrl, setLinkUrl] = useState("/detail");
  const [sortOrder, setSortOrder] = useState("0");
  const [visibleYn, setVisibleYn] = useState<"Y" | "N">("Y");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // -------------------------
  // ✅ 로그인 체크 (기존 패턴 유지)
  // -------------------------
  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      setIsLogin(res.ok);
    } catch (err) {
      console.error("로그인 체크 실패", err);
      setIsLogin(false);
    }
  };

  // -------------------------
  // ✅ 목록 로드
  // -------------------------
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await apiBannerList();
      const list = Array.isArray(data) ? data : [];
      setBannerList(list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "배너 조회 실패");
      setBannerList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // ✅ 생성
  // -------------------------
  const createBanner = async () => {
    const t = title.trim();
    const d = desc.trim();
    const s = Number(sortOrder);

    if (!t) return alert("제목(title)을 입력하세요");
    if (!d) return alert("설명(desc)을 입력하세요");

    try {
      await apiBannerCreate({
        title: t,
        desc: d,
        linkUrl: linkUrl.trim() || "",
        sortOrder: Number.isFinite(s) ? s : 0,
        visibleYn,
        imageFile, // ✅ 선택
      });

      // 입력 초기화(원하면 유지해도 됨)
      setTitle("");
      setDesc("");
      setLinkUrl("");
      setSortOrder("0");
      setVisibleYn("Y");
      setImageFile(null);

      await fetchBanners();
      alert("배너 등록 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "배너 등록 실패");
    }
  };

  // -------------------------
  // ✅ 삭제
  // -------------------------
  const deleteBanner = async (id: number) => {
    if (!confirm("배너를 삭제할까요?")) return;

    try {
      await apiBannerDelete(id);
      await fetchBanners();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "배너 삭제 실패");
    }
  };

  // -------------------------
  // ✅ UI
  // -------------------------
  return (
    <PageWrapper>
      <SideBar />

      <MainContentWrapper>
        <Header onOpenModal={() => {}} isLogin={isLogin} setIsLogin={setIsLogin} />

        <Content>
          <H1>배너 관리 (TEXTBanner 연동)</H1>

          <ContentInner style={{ display: "grid", gap: 12 }}>
            {/* ✅ 등록 폼 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>배너 등록</H5>

              <Form.Control
                style={{ maxWidth: 220 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="title (h1)"
              />

              <Form.Control
                style={{ maxWidth: 320 }}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="desc (p)"
              />

              <Form.Control
                style={{ maxWidth: 260 }}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="linkUrl (/detail 또는 https://...)"
              />

              <Form.Control
                style={{ maxWidth: 120 }}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value.replace(/[^\d-]/g, ""))}
                placeholder="sortOrder"
                inputMode="numeric"
              />

              <Form.Select
                style={{ maxWidth: 120 }}
                value={visibleYn}
                onChange={(e) => setVisibleYn(e.target.value as "Y" | "N")}
              >
                <option value="Y">노출</option>
                <option value="N">숨김</option>
              </Form.Select>

              <Form.Control
                type="file"
                accept="image/*"
                style={{ maxWidth: 260 }}
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setImageFile(f);
                }}
              />

              <Button variant="primary" onClick={createBanner} disabled={loading}>
                배너 추가
              </Button>

              <Button variant="outline-secondary" onClick={fetchBanners} disabled={loading}>
                {loading ? "로딩..." : "새로고침"}
              </Button>
            </div>

            {imageFile && (
              <P style={{ margin: 0, opacity: 0.75 }}>
                선택 이미지: <b>{imageFile.name}</b>
              </P>
            )}

            {/* ✅ 목록 */}
            <div style={{ display: "grid", gap: 10 }}>
              {loading ? (
                <P>배너 불러오는 중...</P>
              ) : bannerList.length === 0 ? (
                <P>등록된 배너가 없습니다.</P>
              ) : (
                bannerList.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    {/* 이미지가 있으면 보여주고, 없으면 박스만 */}
                    {b.imageUrl ? (
                      <img
                        src={`${API_ROOT}${b.imageUrl}`}
                        alt={b.title}
                        style={{
                          width: 160,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 8,
                          background: "#f5f5f5",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 160,
                          height: 90,
                          borderRadius: 8,
                          background: "#f5f5f5",
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

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>{b.title}</b>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>#{b.id}</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          정렬: {b.sortOrder ?? 0} / {b.visibleYn ?? "Y"}
                        </span>
                      </div>

                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{b.desc}</div>

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                        링크: {b.linkUrl ?? "-"}
                      </div>
                    </div>

                    <Button size="sm" variant="outline-danger" onClick={() => deleteBanner(b.id)}>
                      삭제
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ContentInner>
        </Content>
      </MainContentWrapper>
    </PageWrapper>
  );
}