"use client";

import { useEffect, useMemo, useState } from "react";
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

type Yn = "Y" | "N";

type FooterCategory = {
  id: number;
  title: string;
  sortOrder?: number | null;
  visibleYn?: Yn;
};

type FooterLink = {
  id: number;
  categoryId: number;
  label: string;
  url: string;
  sortOrder?: number | null;
  visibleYn?: Yn;
};

type FooterText = {
  id: number;
  paragraph1: string;
  paragraph2: string;
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

// -------------------------
// ✅ API helpers
// -------------------------
async function apiCategories(): Promise<FooterCategory[]> {
  const res = await fetch(`${API_BASE}/footer/categories`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`footer categories failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiCreateCategory(payload: {
  title: string;
  sortOrder?: number;
  visibleYn?: Yn;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/footer/categories`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`category create failed: ${res.status} ${text}`);
  }
  return await res.json().catch(() => null);
}

async function apiDeleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/footer/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`category delete failed: ${res.status} ${text}`);
  }
}

async function apiLinks(categoryId: number): Promise<FooterLink[]> {
  const res = await fetch(`${API_BASE}/footer/categories/${categoryId}/links`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`footer links failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiCreateLink(payload: {
  categoryId: number;
  label: string;
  url: string;
  sortOrder?: number;
  visibleYn?: Yn;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/footer/links`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`link create failed: ${res.status} ${text}`);
  }
  return await res.json().catch(() => null);
}

async function apiDeleteLink(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/footer/links/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`link delete failed: ${res.status} ${text}`);
  }
}

async function apiFooterTextGet(): Promise<FooterText | null> {
  const res = await fetch(`${API_BASE}/footer/text`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

async function apiFooterTextPut(payload: {
  paragraph1: string;
  paragraph2: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/footer/text`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`footer text update failed: ${res.status} ${text}`);
  }
  return await res.json().catch(() => null);
}

// -------------------------
// ✅ Page
// -------------------------
export default function FooterAdminPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);

  // ✅ 1차 카테고리
  const [categories, setCategories] = useState<FooterCategory[]>([]);
  const [catTitle, setCatTitle] = useState("안내");
  const [catSortOrder, setCatSortOrder] = useState("0");
  const [catVisibleYn, setCatVisibleYn] = useState<Yn>("Y");
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");

  // ✅ 2차 링크
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [linkLabel, setLinkLabel] = useState("맴버가입");
  const [linkUrl, setLinkUrl] = useState("/join");
  const [linkSortOrder, setLinkSortOrder] = useState("0");
  const [linkVisibleYn, setLinkVisibleYn] = useState<Yn>("Y");

  // ✅ 하단 문구 2개
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

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
  // ✅ 데이터 로드
  // -------------------------
  const fetchCategories = async () => {
    const data = await apiCategories();
    const arr = Array.isArray(data) ? data : [];
    arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setCategories(arr);

    // ✅ 선택된 카테고리가 없으면 첫 번째 자동 선택
    if (arr.length > 0 && selectedCatId === "") {
      setSelectedCatId(arr[0].id);
    }
  };

  const fetchLinks = async (categoryId: number) => {
    const data = await apiLinks(categoryId);
    const arr = Array.isArray(data) ? data : [];
    arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setLinks(arr);
  };

  const fetchFooterText = async () => {
    const t = await apiFooterTextGet();
    setP1(t?.paragraph1 ?? "");
    setP2(t?.paragraph2 ?? "");
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await fetchCategories();
      await fetchFooterText();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "푸터 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카테고리 선택 변경 시 링크 로드
  useEffect(() => {
    if (selectedCatId === "") {
      setLinks([]);
      return;
    }
    fetchLinks(Number(selectedCatId)).catch((e) => {
      console.error(e);
      setLinks([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatId]);

  const selectedCat = useMemo(
    () => categories.find((c) => c.id === Number(selectedCatId)),
    [categories, selectedCatId]
  );

  // -------------------------
  // ✅ 1차 카테고리 생성/삭제
  // -------------------------
  const createCategory = async () => {
    const t = catTitle.trim();
    const s = Number(catSortOrder);
    if (!t) return alert("카테고리명을 입력하세요.");

    try {
      setLoading(true);
      await apiCreateCategory({
        title: t,
        sortOrder: Number.isFinite(s) ? s : 0,
        visibleYn: catVisibleYn,
      });

      setCatTitle("");
      setCatSortOrder("0");
      setCatVisibleYn("Y");

      await fetchCategories();
      alert("카테고리 등록 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "카테고리 등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("카테고리를 삭제할까요? (하위 링크도 같이 삭제됨)")) return;

    try {
      setLoading(true);
      await apiDeleteCategory(id);
      await fetchCategories();

      // 선택 카테고리가 삭제되었으면 초기화
      if (Number(selectedCatId) === id) setSelectedCatId("");

      alert("삭제 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // ✅ 2차 링크 생성/삭제
  // -------------------------
  const createLink = async () => {
    if (selectedCatId === "") return alert("먼저 1차 카테고리를 선택하세요.");

    const label = linkLabel.trim();
    const url = linkUrl.trim();
    const s = Number(linkSortOrder);

    if (!label) return alert("2차 메뉴명(label)을 입력하세요.");
    if (!url) return alert("URL을 입력하세요.");

    try {
      setLoading(true);
      await apiCreateLink({
        categoryId: Number(selectedCatId),
        label,
        url,
        sortOrder: Number.isFinite(s) ? s : 0,
        visibleYn: linkVisibleYn,
      });

      setLinkLabel("");
      setLinkUrl("");
      setLinkSortOrder("0");
      setLinkVisibleYn("Y");

      await fetchLinks(Number(selectedCatId));
      alert("링크 등록 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "링크 등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: number) => {
    if (!confirm("링크를 삭제할까요?")) return;

    try {
      setLoading(true);
      await apiDeleteLink(id);
      if (selectedCatId !== "") await fetchLinks(Number(selectedCatId));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "링크 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // ✅ 하단 문구 저장
  // -------------------------
  const saveFooterText = async () => {
    try {
      setLoading(true);
      await apiFooterTextPut({ paragraph1: p1, paragraph2: p2 });
      alert("하단 문구 저장 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "저장 실패");
    } finally {
      setLoading(false);
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
          <H1>푸터 메뉴 관리</H1>

          <ContentInner style={{ display: "grid", gap: 18 }}>
            {/* ✅ 1차 카테고리 등록 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>1차 카테고리 등록</H5>

              <Form.Control
                style={{ maxWidth: 220 }}
                value={catTitle}
                onChange={(e) => setCatTitle(e.target.value)}
                placeholder="카테고리명 (h6)"
              />

              <Form.Control
                style={{ maxWidth: 120 }}
                value={catSortOrder}
                onChange={(e) => setCatSortOrder(e.target.value.replace(/[^\d-]/g, ""))}
                placeholder="sortOrder"
                inputMode="numeric"
              />

              <Form.Select
                style={{ maxWidth: 120 }}
                value={catVisibleYn}
                onChange={(e) => setCatVisibleYn(e.target.value as Yn)}
              >
                <option value="Y">노출</option>
                <option value="N">숨김</option>
              </Form.Select>

              <Button variant="primary" onClick={createCategory} disabled={loading}>
                추가
              </Button>

              <Button variant="outline-secondary" onClick={refreshAll} disabled={loading}>
                {loading ? "로딩..." : "새로고침"}
              </Button>
            </div>

            {/* ✅ 1차 카테고리 목록 */}
            <div style={{ display: "grid", gap: 10 }}>
              {categories.length === 0 ? (
                <P>등록된 1차 카테고리가 없습니다.</P>
              ) : (
                categories.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>{c.title}</b>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>#{c.id}</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          정렬: {c.sortOrder ?? 0} / {c.visibleYn ?? "Y"}
                        </span>
                      </div>

                      <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                        <Button
                          size="sm"
                          variant={Number(selectedCatId) === c.id ? "dark" : "outline-dark"}
                          onClick={() => setSelectedCatId(c.id)}
                        >
                          {Number(selectedCatId) === c.id ? "선택됨" : "선택"}
                        </Button>

                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          선택 카테고리: <b>{selectedCat?.title ?? "-"}</b>
                        </span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline-danger" onClick={() => deleteCategory(c.id)}>
                      삭제
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* ✅ 2차 링크 등록 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>2차 링크 등록</H5>

              <Form.Select
                style={{ maxWidth: 240 }}
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : "")}
              >
                {categories.length === 0 ? (
                  <option value="">카테고리 없음</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.title}
                    </option>
                  ))
                )}
              </Form.Select>

              <Form.Control
                style={{ maxWidth: 200 }}
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="메뉴명(label)"
              />

              <Form.Control
                style={{ maxWidth: 320 }}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL (/notice 또는 https://...)"
              />

              <Form.Control
                style={{ maxWidth: 120 }}
                value={linkSortOrder}
                onChange={(e) => setLinkSortOrder(e.target.value.replace(/[^\d-]/g, ""))}
                placeholder="sortOrder"
                inputMode="numeric"
              />

              <Form.Select
                style={{ maxWidth: 120 }}
                value={linkVisibleYn}
                onChange={(e) => setLinkVisibleYn(e.target.value as Yn)}
              >
                <option value="Y">노출</option>
                <option value="N">숨김</option>
              </Form.Select>

              <Button variant="primary" onClick={createLink} disabled={loading}>
                추가
              </Button>
            </div>

            {/* ✅ 2차 링크 목록 */}
            <div style={{ display: "grid", gap: 10 }}>
              {selectedCatId === "" ? (
                <P>2차 링크를 보려면 카테고리를 선택하세요.</P>
              ) : links.length === 0 ? (
                <P>등록된 2차 링크가 없습니다.</P>
              ) : (
                links.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>{l.label}</b>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>#{l.id}</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          정렬: {l.sortOrder ?? 0} / {l.visibleYn ?? "Y"}
                        </span>
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        URL: <span style={{ wordBreak: "break-all" }}>{l.url}</span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline-danger" onClick={() => deleteLink(l.id)}>
                      삭제
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* ✅ 하단 문구 2개 입력/저장 */}
            <div style={{ display: "grid", gap: 10 }}>
              <H5 style={{ margin: 0 }}>하단 문구(2개) 입력</H5>

              <Form.Control
                as="textarea"
                rows={4}
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                placeholder="문단 1"
              />

              <Form.Control
                as="textarea"
                rows={4}
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                placeholder="문단 2"
              />

              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="primary" onClick={saveFooterText} disabled={loading}>
                  저장
                </Button>

                <Button variant="outline-secondary" onClick={fetchFooterText} disabled={loading}>
                  문구 새로고침
                </Button>
              </div>

              <P style={{ margin: 0, opacity: 0.7 }}>
                - 문단은 각각 1개씩 저장됩니다.<br />
                - 사용처: Footer 하단의 두 &lt;p&gt; 영역
              </P>
            </div>
          </ContentInner>
        </Content>
      </MainContentWrapper>
    </PageWrapper>
  );
}