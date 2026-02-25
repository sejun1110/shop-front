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
 * ✅ 메인 배너 관리 (이미지 + 링크만 / 항상 1개 유지)
 *
 * API (Spring)
 * - GET  /api/main-banner
 * - POST /api/main-banner   (multipart/form-data)  ✅ 항상 1개 유지(기존 DB/파일 삭제 후 저장) / image 필수
 * - PUT  /api/main-banner   (multipart/form-data)  ✅ 수정(이미지 선택이면 교체, 없으면 링크만 변경)
 */

type MainBanner = {
  id: number;
  imageUrl: string; // 예: /uploads/main/xxx.png
  linkUrl?: string | null;
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

// -------------------------
// ✅ API helpers
// -------------------------
async function apiMainBannerGet(): Promise<MainBanner | null> {
  const res = await fetch(`${API_BASE}/main-banner`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  return data;
}

/** ✅ POST: 항상 1개 유지(기존 삭제 후 새로 저장) - image 필수 */
async function apiMainBannerCreateReplace(payload: {
  linkUrl?: string;
  imageFile: File;
}): Promise<MainBanner> {
  const fd = new FormData();
  fd.append("image", payload.imageFile);
  if (payload.linkUrl) fd.append("linkUrl", payload.linkUrl);

  const res = await fetch(`${API_BASE}/main-banner`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`main-banner create failed: ${res.status} ${text}`);
  }
  return await res.json();
}

/** ✅ PUT: 수정(이미지 선택이면 교체, 없으면 링크만 변경) */
async function apiMainBannerUpdate(payload: {
  linkUrl?: string;
  imageFile?: File | null;
}): Promise<MainBanner> {
  const fd = new FormData();
  if (payload.linkUrl != null) fd.append("linkUrl", payload.linkUrl);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const res = await fetch(`${API_BASE}/main-banner`, {
    method: "PUT",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`main-banner update failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// -------------------------
// ✅ Page Component
// -------------------------
export default function BannerPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  // ✅ 현재 배너(항상 1개)
  const [banner, setBanner] = useState<MainBanner | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 입력값 (이미지 + 링크만)
  const [linkUrl, setLinkUrl] = useState("");
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
  // ✅ 배너 로드
  // -------------------------
  const fetchBanner = async () => {
    setLoading(true);
    try {
      const data = await apiMainBannerGet();
      setBanner(data);
      // 링크 입력값은 현재 배너 기준으로 채워두기(편의)
      setLinkUrl(data?.linkUrl ?? "");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "배너 조회 실패");
      setBanner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
    fetchBanner();
  }, []);

  // -------------------------
  // ✅ POST 등록: 항상 1개 유지 (이미지 필수)
  // -------------------------
  const createReplace = async () => {
    if (!imageFile) return alert("이미지를 선택하세요 (POST 등록은 이미지 필수)");

    try {
      setLoading(true);
      await apiMainBannerCreateReplace({
        linkUrl: linkUrl.trim() || undefined,
        imageFile,
      });

      setImageFile(null);
      await fetchBanner();
      alert("등록 완료! (기존 배너는 자동 삭제됨)");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // ✅ PUT 수정: 이미지 선택이면 교체, 없으면 링크만 변경
  // -------------------------
  const updateBanner = async () => {
    try {
      setLoading(true);
      await apiMainBannerUpdate({
        linkUrl: linkUrl.trim() || "",
        imageFile, // null이면 링크만 변경됨
      });

      setImageFile(null);
      await fetchBanner();
      alert("수정 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const imageSrc = banner?.imageUrl ? `${API_ROOT}${banner.imageUrl}` : "/img/banner.png";

  // -------------------------
  // ✅ UI
  // -------------------------
  return (
    <PageWrapper>
      <SideBar />

      <MainContentWrapper>
        <Header onOpenModal={() => {}} isLogin={isLogin} setIsLogin={setIsLogin} />

        <Content>
          <H1>메인 배너 관리 (이미지 + 링크 / 항상 1개)</H1>

          <ContentInner style={{ display: "grid", gap: 12 }}>
            {/* 등록/수정 폼 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>배너 설정</H5>

              <Form.Control
                style={{ maxWidth: 420 }}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="링크 (예: /event/1 또는 https://...)"
              />

              <Form.Control
                type="file"
                accept="image/*"
                style={{ maxWidth: 280 }}
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setImageFile(f);
                }}
              />

              <Button variant="primary" onClick={createReplace} disabled={loading}>
                {loading ? "처리중..." : "POST 등록(교체)"}
              </Button>

              <Button variant="warning" onClick={updateBanner} disabled={loading}>
                {loading ? "처리중..." : "PUT 수정"}
              </Button>

              <Button variant="outline-secondary" onClick={fetchBanner} disabled={loading}>
                {loading ? "로딩..." : "새로고침"}
              </Button>
            </div>

            {imageFile && (
              <P style={{ margin: 0, opacity: 0.75 }}>
                선택됨: <b>{imageFile.name}</b> ({Math.round(imageFile.size / 1024)} KB) —{" "}
                <span style={{ opacity: 0.75 }}>PUT은 이미지 선택 안 하면 링크만 수정됩니다.</span>
              </P>
            )}

            {/* 현재 배너 미리보기 */}
            <div style={{ display: "grid", gap: 10 }}>
              {loading ? (
                <P>불러오는 중...</P>
              ) : (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 10,
                    padding: 12,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="main-banner"
                    style={{
                      width: 240,
                      height: 135,
                      objectFit: "cover",
                      borderRadius: 8,
                      background: "#f5f5f5",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <b>현재 배너</b>
                      {banner?.id ? (
                        <span style={{ fontSize: 12, opacity: 0.6 }}>#{banner.id}</span>
                      ) : (
                        <span style={{ fontSize: 12, opacity: 0.6 }}>(없음)</span>
                      )}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                      링크: {banner?.linkUrl ? banner.linkUrl : "-"}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      {banner?.linkUrl ? (
                        <a href={banner.linkUrl} target="_blank" rel="noreferrer">
                          링크 테스트 열기
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, opacity: 0.6 }}>
                          링크가 없으면 이미지 클릭 이동 없음
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
                      - POST 등록: 기존 배너 DB/파일 자동 삭제 후 새로 저장<br />
                      - PUT 수정: 이미지 선택 시 교체, 미선택 시 링크만 변경
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ContentInner>
        </Content>
      </MainContentWrapper>
    </PageWrapper>
  );
}