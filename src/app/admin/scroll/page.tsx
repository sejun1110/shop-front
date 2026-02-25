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
 * ✅ 스크롤 배너 관리 (여러 개 등록/목록/삭제)
 *
 * API (Spring)
 * - GET    /api/scroll-banners
 * - POST   /api/scroll-banners        (multipart/form-data)
 * - DELETE /api/scroll-banners/{id}
 *
 * 사용 필드:
 * - title, imageUrl, linkUrl, buttonText, buttonLinkUrl, sortOrder, visibleYn
 */

type ScrollBannerItem = {
  id: number;
  title: string;
  imageUrl?: string | null;

  linkUrl?: string | null;

  buttonText?: string | null;
  buttonLinkUrl?: string | null;

  sortOrder?: number | null;
  visibleYn?: "Y" | "N";
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

// -------------------------
// ✅ API helpers
// -------------------------
async function apiScrollBannerList(): Promise<ScrollBannerItem[]> {
  const res = await fetch(`${API_BASE}/scroll-banners`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`scroll banners failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiScrollBannerCreate(payload: {
  title: string;
  linkUrl?: string;
  buttonText?: string;
  buttonLinkUrl?: string;
  sortOrder?: number;
  visibleYn?: "Y" | "N";
  imageFile?: File | null; // ✅ 선택
}): Promise<any> {
  const fd = new FormData();
  fd.append("title", payload.title.trim());
  fd.append("visibleYn", (payload.visibleYn ?? "Y").toString().trim().toUpperCase());

  if (payload.linkUrl != null) fd.append("linkUrl", payload.linkUrl.trim());
  if (payload.buttonText != null) fd.append("buttonText", payload.buttonText.trim());
  if (payload.buttonLinkUrl != null) fd.append("buttonLinkUrl", payload.buttonLinkUrl.trim());
  if (payload.sortOrder != null) fd.append("sortOrder", String(payload.sortOrder));
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const res = await fetch(`${API_BASE}/scroll-banners`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`scroll banner create failed: ${res.status} ${text}`);
  }
  return await res.json().catch(() => null);
}

async function apiScrollBannerDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/scroll-banners/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`scroll banner delete failed: ${res.status} ${text}`);
  }
}

// -------------------------
// ✅ Page Component
// -------------------------
export default function ScrollBannerAdminPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const [list, setList] = useState<ScrollBannerItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 입력 폼
  const [title, setTitle] = useState("나이키 머큐리얼 베이퍼");
  const [linkUrl, setLinkUrl] = useState("/detail");
  const [buttonText, setButtonText] = useState("구매하기");
  const [buttonLinkUrl, setButtonLinkUrl] = useState("/buy");
  const [sortOrder, setSortOrder] = useState("0");
  const [visibleYn, setVisibleYn] = useState<"Y" | "N">("Y");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // -------------------------
  // ✅ 로그인 체크
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
  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await apiScrollBannerList();
      const arr = Array.isArray(data) ? data : [];
      setList(arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "스크롤 배너 조회 실패");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // ✅ 생성
  // -------------------------
  const createItem = async () => {
    const t = title.trim();
    const s = Number(sortOrder);

    if (!t) return alert("제목(title)을 입력하세요");

    try {
      await apiScrollBannerCreate({
        title: t,
        linkUrl: linkUrl.trim() || "",
        buttonText: buttonText.trim() || "구매하기",
        buttonLinkUrl: buttonLinkUrl.trim() || "",
        sortOrder: Number.isFinite(s) ? s : 0,
        visibleYn,
        imageFile, // ✅ 선택
      });

      // 입력 초기화
      setTitle("");
      setLinkUrl("");
      setButtonText("구매하기");
      setButtonLinkUrl("");
      setSortOrder("0");
      setVisibleYn("Y");
      setImageFile(null);

      await fetchList();
      alert("스크롤 배너 등록 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "스크롤 배너 등록 실패");
    }
  };

  // -------------------------
  // ✅ 삭제
  // -------------------------
  const deleteItem = async (id: number) => {
    if (!confirm("스크롤 배너를 삭제할까요?")) return;

    try {
      await apiScrollBannerDelete(id);
      await fetchList();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "스크롤 배너 삭제 실패");
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
          <H1>스크롤 배너 관리</H1>

          <ContentInner style={{ display: "grid", gap: 12 }}>
            {/* ✅ 등록 폼 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>배너 등록</H5>

              <Form.Control
                style={{ maxWidth: 220 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="title (h2)"
              />

              <Form.Control
                style={{ maxWidth: 240 }}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="카드 링크 linkUrl"
              />

              <Form.Control
                style={{ maxWidth: 160 }}
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="버튼 텍스트 (구매하기)"
              />

              <Form.Control
                style={{ maxWidth: 240 }}
                value={buttonLinkUrl}
                onChange={(e) => setButtonLinkUrl(e.target.value)}
                placeholder="버튼 링크 buttonLinkUrl"
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

              <Button variant="primary" onClick={createItem} disabled={loading}>
                배너 추가
              </Button>

              <Button variant="outline-secondary" onClick={fetchList} disabled={loading}>
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
              ) : list.length === 0 ? (
                <P>등록된 스크롤 배너가 없습니다.</P>
              ) : (
                list.map((b) => (
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

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        카드링크: {b.linkUrl ?? "-"}
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        버튼: {b.buttonText ?? "구매하기"} / {b.buttonLinkUrl ?? "-"}
                      </div>
                    </div>

                    <Button size="sm" variant="outline-danger" onClick={() => deleteItem(b.id)}>
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