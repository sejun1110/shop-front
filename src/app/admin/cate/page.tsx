"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Header from "@/include/Header";
import ProductModal from "@/modal/ProductModal";
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

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

type Product = {
  id: number;
  title: string;
  desc: string;
  price: number;
  primaryCategory?: number;
  secondaryCategory?: number;
  imageUrl?: string;
};

type CategoryNode = {
  id: number;
  name: string;
  children?: CategoryNode[];
};

const LS_KEY = "categories";

/** localStorage helpers */
const loadCategoriesLS = (): CategoryNode[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const saveCategoriesLS = (cats: CategoryNode[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(cats));
};

const nextIdFrom = (cats: CategoryNode[]) => {
  let max = 0;
  for (const p of cats) {
    max = Math.max(max, p.id);
    for (const c of p.children ?? []) {
      max = Math.max(max, c.id);
    }
  }
  return max + 1;
};

export default function Category() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentProductId, setCurrentProductId] = useState<number | undefined>(undefined);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  /** ✅ 카테고리 상태 (등록/조회/선택) */
  const [categoryList, setCategoryList] = useState<CategoryNode[]>([]);
  const [primaryName, setPrimaryName] = useState("");
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<number | "">("");
  const [secondaryName, setSecondaryName] = useState("");

  // -------------------------
  // ✅ 상품 리스트 조회
  // -------------------------
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
      if (!res.ok) throw new Error("상품 리스트 불러오기 실패");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("상품 로딩 실패", err);
    }
  };

  // 삭제 처리
  const handleDelete = async (id: number) => {
    if (!confirm("삭제할까요?")) return;
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  // 로그인 상태 체크
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
  // ✅ 카테고리: API 우선 / 실패 시 localStorage
  // -------------------------
  const fetchCategories = async () => {
    // 1) API 시도
    try {
      const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategoryList(data);
          saveCategoriesLS(data);
          return;
        }
      }
    } catch (e) {
      // ignore (fallback)
    }

    // 2) localStorage fallback
    const ls = loadCategoriesLS();
    setCategoryList(ls);
  };

  const createPrimary = async () => {
    const name = primaryName.trim();
    if (!name) return alert("1차 카테고리명을 입력하세요.");

    // 1) API 시도
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await fetchCategories();
        setPrimaryName("");
        return;
      }
    } catch (e) {
      // ignore (fallback)
    }

    // 2) localStorage fallback
    setCategoryList((prev) => {
      const id = nextIdFrom(prev);
      const next = [...prev, { id, name, children: [] }];
      saveCategoriesLS(next);
      return next;
    });
    setPrimaryName("");
  };

  /*const createSecondary = async () => {
    const name = secondaryName.trim();
    if (!name) return alert("2차 카테고리명을 입력하세요.");
    if (selectedPrimaryId === "") return alert("부모(1차) 카테고리를 선택하세요.");

    const primaryId = Number(selectedPrimaryId);

    // 1) API 시도
    try {
      const res = await fetch(`${API_BASE}/categories/${primaryId}/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await fetchCategories();
        setSecondaryName("");
        return;
      }
    } catch (e) {
      // ignore (fallback)
    }

    // 2) localStorage fallback
    setCategoryList((prev) => {
      const id = nextIdFrom(prev);
      const next = prev.map((p) => {
        if (p.id !== primaryId) return p;
        const children = p.children ?? [];
        return { ...p, children: [...children, { id, name }] };
      });
      saveCategoriesLS(next);
      return next;
    });
    setSecondaryName("");
  };*/
const createSecondary = async () => {
  const name = secondaryName.trim();
  if (!name) return alert("2차 카테고리명을 입력하세요.");
  if (selectedPrimaryId === "") return alert("부모(1차) 카테고리를 선택하세요.");

  const parentId = Number(selectedPrimaryId);

  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }), // parentId 포함
    });
    if (res.ok) {
      await fetchCategories();
      setSecondaryName("");
      return;
    }
  } catch (e) {
    console.error("2차 카테고리 생성 실패", e);
  }
};



  const deletePrimary = async (primaryId: number) => {
    if (!confirm("1차 카테고리를 삭제할까요? (하위 2차도 같이 삭제됩니다)")) return;

    // 1) API 시도
    try {
      const res = await fetch(`${API_BASE}/categories/${primaryId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCategories();
        // 선택 중이면 해제
        setSelectedPrimaryId((prev) => (prev === primaryId ? "" : prev));
        return;
      }
    } catch (e) {
      // ignore (fallback)
    }

    // 2) localStorage fallback
    setCategoryList((prev) => {
      const next = prev.filter((p) => p.id !== primaryId);
      saveCategoriesLS(next);
      return next;
    });
    setSelectedPrimaryId((prev) => (prev === primaryId ? "" : prev));
  };

  const deleteSecondary = async (primaryId: number, secondaryId: number) => {
    if (!confirm("2차 카테고리를 삭제할까요?")) return;

    // 1) API 시도
    try {
      const res = await fetch(`${API_BASE}/categories/${primaryId}/children/${secondaryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCategories();
        return;
      }
    } catch (e) {
      // ignore (fallback)
    }

    // 2) localStorage fallback
    setCategoryList((prev) => {
      const next = prev.map((p) => {
        if (p.id !== primaryId) return p;
        return { ...p, children: (p.children ?? []).filter((c) => c.id !== secondaryId) };
      });
      saveCategoriesLS(next);
      return next;
    });
  };

  // -------------------------
  // ✅ 카테고리 이름 표시 (등록된 state 기준)
  // -------------------------
  const getCategoryName = (primaryId?: number, secondaryId?: number) => {
    const primary = categoryList.find((c) => c.id === primaryId);
    const secondary = primary?.children?.find((c) => c.id === secondaryId);
    if (!primary || !secondary) return "카테고리 없음";
    return `${primary.name} / ${secondary.name}`;
  };

  useEffect(() => {
    fetchProducts();
    checkLogin();
    fetchCategories();
  }, []);

  // 모달 열기
  const openModal = (mode: "create" | "edit" | "view", productId?: number) => {
    setModalMode(mode);
    setCurrentProductId(productId);
    setShowModal(true);
  };

  const selectedPrimary = useMemo(
    () => categoryList.find((c) => c.id === Number(selectedPrimaryId)),
    [categoryList, selectedPrimaryId]
  );

  return (
    <>
      <PageWrapper>
        <SideBar />

        <MainContentWrapper>
          <Header onOpenModal={() => openModal("create")} isLogin={isLogin} setIsLogin={setIsLogin} />

          {/* ✅ 카테고리 관리 섹션 */}
          <Content>
            <H1>카테고리 관리</H1>

            <ContentInner style={{ display: "grid", gap: 12 }}>
              {/* 1차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>1차 카테고리 등록</H5>
                <Form.Control
                  style={{ maxWidth: 320 }}
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  placeholder="예: 의류, 잡화, 생활용품..."
                />
                <Button variant="primary" onClick={createPrimary}>
                  1차 추가
                </Button>
                <Button variant="outline-secondary" onClick={fetchCategories}>
                  새로고침
                </Button>
              </div>

              {/* 2차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>2차 카테고리 등록</H5>
                <Form.Select
                  style={{ maxWidth: 260 }}
                  value={selectedPrimaryId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedPrimaryId(v === "" ? "" : Number(v));
                  }}
                >
                  <option value="">부모(1차) 선택</option>
                  {categoryList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  style={{ maxWidth: 320 }}
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                  placeholder="예: 티셔츠, 셔츠, 바지..."
                />

                <Button variant="success" onClick={createSecondary}>
                  2차 추가
                </Button>
              </div>

              {/* 카테고리 목록/삭제 */}
              <div style={{ display: "grid", gap: 10 }}>
                {categoryList.length === 0 ? (
                  <P>등록된 카테고리가 없습니다. 위에서 1차/2차를 추가하세요.</P>
                ) : (
                  categoryList.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <H5 style={{ margin: 0 }}>{p.name}</H5>
                        <P style={{ margin: 0, opacity: 0.7 }}>({p.id})</P>

                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setSelectedPrimaryId(p.id)}
                          >
                            2차 추가 대상 선택
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deletePrimary(p.id)}>
                            1차 삭제
                          </Button>
                        </div>
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {(p.children ?? []).length === 0 ? (
                          <P style={{ margin: 0 }}>2차 카테고리가 없습니다.</P>
                        ) : (
                          (p.children ?? []).map((c) => (
                            <div
                              key={c.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 10px",
                                border: "1px solid rgba(0,0,0,0.08)",
                                borderRadius: 999,
                              }}
                            >
                              <span style={{ fontSize: 14 }}>{c.name}</span>
                              <span style={{ fontSize: 12, opacity: 0.6 }}>({c.id})</span>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => deleteSecondary(p.id, c.id)}
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
            </ContentInner>
          </Content>

          
          <ProductModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSaved={() => {
              setShowModal(false);
              fetchProducts();
              // 카테고리도 함께 최신화(상품 저장 시 카테고리 변경 가능성)
              fetchCategories();
            }}
            productId={currentProductId}
            mode={modalMode}
            isLogin={isLogin ?? false}
          />
        </MainContentWrapper>
      </PageWrapper>
    </>
  );
}
