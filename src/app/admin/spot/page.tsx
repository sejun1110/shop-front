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
 * ✅ SPOT 아이콘 관리 (SpotItem / SpotBanner 연동용)
 *
 * API (Spring)
 * - GET    /api/spot-items
 * - POST   /api/spot-items        (multipart/form-data)  ※ image 선택 업로드(없어도 됨)
 * - DELETE /api/spot-items/{id}
 *
 * SpotBanner에서 사용 필드:
 * - title, imageUrl, linkUrl, sortOrder, visibleYn
 */

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

// -------------------------
// ✅ API helpers
// -------------------------
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

async function apiSpotCreate(payload: {
  title: string;
  linkUrl?: string;
  sortOrder?: number;
  visibleYn?: "Y" | "N";
  imageFile?: File | null; // ✅ 선택
}): Promise<any> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("visibleYn", payload.visibleYn ?? "Y");
  if (payload.linkUrl != null) fd.append("linkUrl", payload.linkUrl);
  if (payload.sortOrder != null) fd.append("sortOrder", String(payload.sortOrder));
  if (payload.imageFile) fd.append("image", payload.imageFile); // ✅ 선택

  const res = await fetch(`${API_BASE}/spot-items`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`spot create failed: ${res.status} ${text}`);
  }
  return await res.json().catch(() => null);
}

async function apiSpotDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/spot-items/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`spot delete failed: ${res.status} ${text}`);
  }
}

// -------------------------
// ✅ Page Component
// -------------------------
export default function SpotItemAdminPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const [list, setList] = useState<SpotItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 입력 폼
  const [title, setTitle] = useState("에어 조던1");
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
  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await apiSpotList();
      const arr = Array.isArray(data) ? data : [];
      setList(arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "SPOT 아이콘 조회 실패");
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
      await apiSpotCreate({
        title: t,
        linkUrl: linkUrl.trim() || "",
        sortOrder: Number.isFinite(s) ? s : 0,
        visibleYn,
        imageFile, // ✅ 선택
      });

      // 입력 초기화(원하면 유지해도 됨)
      setTitle("");
      setLinkUrl("");
      setSortOrder("0");
      setVisibleYn("Y");
      setImageFile(null);

      await fetchList();
      alert("SPOT 아이콘 등록 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "SPOT 아이콘 등록 실패");
    }
  };

  // -------------------------
  // ✅ 삭제
  // -------------------------
  const deleteItem = async (id: number) => {
    if (!confirm("삭제할까요?")) return;

    try {
      await apiSpotDelete(id);
      await fetchList();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 실패");
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
          <H1>SPOT 아이콘 관리</H1>

          <ContentInner style={{ display: "grid", gap: 12 }}>
            {/* ✅ 등록 폼 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>아이콘 등록</H5>

              <Form.Control
                style={{ maxWidth: 220 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="title (h6)"
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

              <Button variant="primary" onClick={createItem} disabled={loading}>
                아이콘 추가
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
                <P>불러오는 중...</P>
              ) : list.length === 0 ? (
                <P>등록된 아이콘이 없습니다.</P>
              ) : (
                list.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    {it.imageUrl ? (
                      <img
                        src={`${API_ROOT}${it.imageUrl}`}
                        alt={it.title}
                        style={{
                          width: 90,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 12,
                          background: "#f5f5f5",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 12,
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
                        <b>{it.title}</b>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>#{it.id}</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          정렬: {it.sortOrder ?? 0} / {it.visibleYn ?? "Y"}
                        </span>
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                        링크: {it.linkUrl ?? "-"}
                      </div>
                    </div>

                    <Button size="sm" variant="outline-danger" onClick={() => deleteItem(it.id)}>
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