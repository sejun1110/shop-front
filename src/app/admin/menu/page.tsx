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

/**
 * ✅ 네비게이션 메뉴 관리 (DB 연동 버전)
 * - localStorage 사용 ❌ (완전 제거)
 * - 백엔드 API 사용 ✅
 *
 * API (Spring)
 * - GET    /api/nav-menus/tree
 * - POST   /api/nav-menus
 * - DELETE /api/nav-menus/{id}
 */

type MenuNode = {
  id: number;
  name: string;
  path?: string | null;
  children?: MenuNode[];
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

// -------------------------
// ✅ API helpers
// -------------------------
async function apiTree(): Promise<MenuNode[]> {
  const res = await fetch(`${API_BASE}/nav-menus/tree`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`tree failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiCreate(payload: {
  name: string;
  parentId?: number;
  path?: string;
  sortOrder?: number;
  visibleYn?: "Y" | "N";
}): Promise<any> {
  const res = await fetch(`${API_BASE}/nav-menus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`create failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function apiDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/nav-menus/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`delete failed: ${res.status} ${text}`);
  }
}

// -------------------------
// ✅ Page Component
// -------------------------
export default function NavMenuPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  // ✅ 메뉴 트리
  const [menuList, setMenuList] = useState<MenuNode[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  // ✅ 입력값 (1/2/3차)
  const [menu1Name, setMenu1Name] = useState("");
  const [menu2Name, setMenu2Name] = useState("");
  const [menu3Name, setMenu3Name] = useState("");
  const [menu3Path, setMenu3Path] = useState("");

  // ✅ 선택값
  const [selectedMenu1Id, setSelectedMenu1Id] = useState<number | "">("");
  const [selectedMenu2Id, setSelectedMenu2Id] = useState<number | "">("");

  // -------------------------
  // ✅ 로그인 체크 (기존 패턴 유지)
  // -------------------------
  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      // 401은 로그인 안됨이므로 정상 케이스로 조용히 처리
      setIsLogin(res.ok);
    } catch (err) {
      console.error("로그인 체크 실패", err);
      setIsLogin(false);
    }
  };

  // -------------------------
  // ✅ 메뉴 로드
  // -------------------------
  const fetchMenus = async () => {
    setLoadingMenus(true);
    try {
      const data = await apiTree();
      setMenuList(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "메뉴 조회 실패");
      setMenuList([]);
    } finally {
      setLoadingMenus(false);
    }
  };

  useEffect(() => {
    checkLogin();
    fetchMenus();
  }, []);

  // -------------------------
  // ✅ 선택된 메뉴 객체 (useMemo)
  // -------------------------
  const selectedMenu1 = useMemo(
    () => menuList.find((m1) => m1.id === Number(selectedMenu1Id)),
    [menuList, selectedMenu1Id]
  );

  const selectedMenu2 = useMemo(
    () =>
      (selectedMenu1?.children ?? []).find(
        (m2) => m2.id === Number(selectedMenu2Id)
      ),
    [selectedMenu1, selectedMenu2Id]
  );

  // -------------------------
  // ✅ 생성 (DB 저장)
  // -------------------------
  const createMenu1 = async () => {
    const name = menu1Name.trim();
    if (!name) return alert("1차 메뉴명을 입력하세요");

    try {
      await apiCreate({ name }); // parentId 없음 → 1차
      setMenu1Name("");
      await fetchMenus();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "1차 메뉴 생성 실패");
    }
  };

  const createMenu2 = async () => {
    const name = menu2Name.trim();
    if (!name) return alert("2차 메뉴명을 입력하세요");
    if (selectedMenu1Id === "") return alert("부모(1차) 메뉴를 선택하세요.");

    try {
      await apiCreate({
        name,
        parentId: Number(selectedMenu1Id),
      });
      setMenu2Name("");
      await fetchMenus();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "2차 메뉴 생성 실패");
    }
  };

  const createMenu3 = async () => {
    const name = menu3Name.trim();
    const path = menu3Path.trim();

    if (!name) return alert("3차 메뉴명을 입력하세요.");
    if (!path) return alert("3차 메뉴 경로(path)를 입력하세요. 예: /men/tshirt");
    if (selectedMenu1Id === "") return alert("부모(1차) 메뉴를 먼저 선택하세요");
    if (selectedMenu2Id === "") return alert("부모(2차) 메뉴를 먼저 선택하세요");

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    try {
      await apiCreate({
        name,
        parentId: Number(selectedMenu2Id), // ✅ 3차의 부모는 2차
        path: normalizedPath,
      });
      setMenu3Name("");
      setMenu3Path("");
      await fetchMenus();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "3차 메뉴 생성 실패");
    }
  };

  // -------------------------
  // ✅ 삭제 (DB 삭제)
  // -------------------------
  const deleteMenu1 = async (menu1Id: number) => {
    if (!confirm("1차 메뉴를 삭제할까요? (하위 2/3차도 같이 삭제됩니다)")) return;

    try {
      await apiDelete(menu1Id);
      setSelectedMenu1Id((prev) => (prev === menu1Id ? "" : prev));
      setSelectedMenu2Id("");
      await fetchMenus();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "1차 메뉴 삭제 실패");
    }
  };

  const deleteMenu2 = async (menu2Id: number) => {
    if (!confirm("2차 메뉴를 삭제할까요? (하위 3차도 같이 삭제됩니다)")) return;

    try {
      await apiDelete(menu2Id);
      setSelectedMenu2Id((prev) => (prev === menu2Id ? "" : prev));
      await fetchMenus();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "2차 메뉴 삭제 실패");
    }
  };

  const deleteMenu3 = async (menu3Id: number) => {
    if (!confirm("3차 메뉴를 삭제할까요?")) return;

    try {
      await apiDelete(menu3Id);
      await fetchMenus();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "3차 메뉴 삭제 실패");
    }
  };

  // -------------------------
  // ✅ UI
  // -------------------------
  return (
    <>
      <PageWrapper>
        <SideBar />

        <MainContentWrapper>
          {/* Header 재사용 */}
          <Header onOpenModal={() => {}} isLogin={isLogin} setIsLogin={setIsLogin} />

          <Content>
            <H1>네비게이션 메뉴 관리 (DB 연동)</H1>

            <ContentInner style={{ display: "grid", gap: 12 }}>
              {/* 1차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>1차 메뉴 등록</H5>

                <Form.Control
                  style={{ maxWidth: 320 }}
                  value={menu1Name}
                  onChange={(e) => setMenu1Name(e.target.value)}
                  placeholder="예: 쇼핑몰, 고객센터..."
                />

                <Button variant="primary" onClick={createMenu1}>
                  1차 추가
                </Button>

                <Button variant="outline-secondary" onClick={fetchMenus} disabled={loadingMenus}>
                  {loadingMenus ? "로딩..." : "새로고침"}
                </Button>
              </div>

              {/* 2차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>2차 메뉴 등록</H5>

                <Form.Select
                  style={{ maxWidth: 260 }}
                  value={selectedMenu1Id}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedMenu1Id(v === "" ? "" : Number(v));
                    setSelectedMenu2Id("");
                  }}
                >
                  <option value="">부모(1차) 선택</option>
                  {menuList.map((m1) => (
                    <option key={m1.id} value={m1.id}>
                      {m1.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  style={{ maxWidth: 320 }}
                  value={menu2Name}
                  onChange={(e) => setMenu2Name(e.target.value)}
                  placeholder="예: 남성, 여성, 공지사항..."
                />

                <Button variant="success" onClick={createMenu2} disabled={selectedMenu1Id === ""}>
                  2차 추가
                </Button>
              </div>

              {/* 3차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>3차 메뉴 등록</H5>

                <Form.Select
                  style={{ maxWidth: 260 }}
                  value={selectedMenu2Id}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedMenu2Id(v === "" ? "" : Number(v));
                  }}
                  disabled={selectedMenu1Id === ""}
                >
                  <option value="">
                    {selectedMenu1Id === "" ? "먼저 1차 선택" : "부모(2차) 선택"}
                  </option>
                  {(selectedMenu1?.children ?? []).map((m2) => (
                    <option key={m2.id} value={m2.id}>
                      {m2.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  style={{ maxWidth: 220 }}
                  value={menu3Name}
                  onChange={(e) => setMenu3Name(e.target.value)}
                  placeholder="예: 티셔츠, 바지..."
                />
                <Form.Control
                  style={{ maxWidth: 260 }}
                  value={menu3Path}
                  onChange={(e) => setMenu3Path(e.target.value)}
                  placeholder="예: /men/tshirt"
                />

                <Button
                  variant="warning"
                  onClick={createMenu3}
                  disabled={selectedMenu1Id === "" || selectedMenu2Id === ""}
                >
                  3차 추가
                </Button>
              </div>

              {/* 목록 */}
              <div style={{ display: "grid", gap: 10 }}>
                {loadingMenus ? (
                  <P>메뉴 불러오는 중...</P>
                ) : menuList.length === 0 ? (
                  <P>등록된 메뉴가 없습니다. 위에서 1차/2차/3차를 추가하세요.</P>
                ) : (
                  menuList.map((m1) => (
                    <div
                      key={m1.id}
                      style={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      {/* 1차 헤더 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <H5 style={{ margin: 0 }}>{m1.name}</H5>
                        <P style={{ margin: 0, opacity: 0.7 }}>({m1.id})</P>

                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              setSelectedMenu1Id(m1.id);
                              setSelectedMenu2Id("");
                            }}
                          >
                            2/3차 추가 대상 선택
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteMenu1(m1.id)}>
                            1차 삭제
                          </Button>
                        </div>
                      </div>

                      {/* 2차 목록 */}
                      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {(m1.children ?? []).length === 0 ? (
                          <P style={{ margin: 0 }}>2차 메뉴가 없습니다.</P>
                        ) : (
                          (m1.children ?? []).map((m2) => (
                            <div
                              key={m2.id}
                              style={{
                                border: "1px solid rgba(0,0,0,0.06)",
                                borderRadius: 10,
                                padding: 10,
                              }}
                            >
                              {/* 2차 헤더 */}
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{m2.name}</span>
                                <span style={{ fontSize: 12, opacity: 0.6 }}>({m2.id})</span>

                                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => {
                                      setSelectedMenu1Id(m1.id);
                                      setSelectedMenu2Id(m2.id);
                                    }}
                                  >
                                    3차 추가 대상 선택
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => deleteMenu2(m2.id)}
                                  >
                                    2차 삭제
                                  </Button>
                                </div>
                              </div>

                              {/* 3차 목록 */}
                              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {(m2.children ?? []).length === 0 ? (
                                  <P style={{ margin: 0 }}>3차 메뉴가 없습니다.</P>
                                ) : (
                                  (m2.children ?? []).map((m3) => (
                                    <div
                                      key={m3.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "6px 10px",
                                        border: "1px solid rgba(0,0,0,0.08)",
                                        borderRadius: 999,
                                      }}
                                    >
                                      <span style={{ fontSize: 14 }}>{m3.name}</span>
                                      <span style={{ fontSize: 12, opacity: 0.6 }}>({m3.id})</span>
                                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                                        {m3.path ?? "-"}
                                      </span>

                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => deleteMenu3(m3.id)}
                                        style={{ padding: "2px 8px" }}
                                      >
                                        삭제
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 선택 상태 표시 */}
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                <P style={{ margin: 0 }}>
                  선택된 1차: <b>{selectedMenu1Id === "" ? "-" : selectedMenu1?.name ?? "-"}</b>
                  {"  "} / 선택된 2차: <b>{selectedMenu2Id === "" ? "-" : selectedMenu2?.name ?? "-"}</b>
                </P>
              </div>
            </ContentInner>
          </Content>
        </MainContentWrapper>
      </PageWrapper>
    </>
  );
}
