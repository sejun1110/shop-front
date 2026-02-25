"use client";

import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Header from "@/include/Header";
import ProductModal from "@/modal/ProductModal";
import {
  PageWrapper,
  MainContentWrapper,
  Content,
  ProductCard,
  ProductDetails,
  ButtonGroup,
  H1,
  H5,
  ProductImage,
  ContentInner,
  P,
  Pprice,
} from "@/styled/Admin.styles";
import SideBar from "./include/SideBar";

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

/* --------------------------------
   ✅ nav-menu 구조로 변경
-------------------------------- */
type MenuNode = {
  id: number;
  name: string;
  children?: MenuNode[];
};

type Product = {
  id: number;
  title: string;
  desc: string;
  price: number;
  imageUrl?: string;

  // ✅ 이제 categoryId 하나만 사용 (3차 기준)
  categoryId?: number;

  // ✅ 추가
  sizes?: { size: number; stock: number }[];
  specs?: { label: string; value: string }[];

};

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]); // ✅ 변경

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] =
    useState<"create" | "edit" | "view">("create");
  const [currentProductId, setCurrentProductId] =
    useState<number | undefined>(undefined);

  const [isLogin, setIsLogin] = useState<boolean>(false);
  const onOpenModal = () => openModal("create");

  /* -----------------------------
     ✅ nav 메뉴 조회
  ----------------------------- */
  const fetchMenus = async () => {
    try {
      const res = await fetch(`${API_BASE}/nav-menus/tree`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("메뉴 로딩 실패");

      const data = await res.json();
      setMenuTree(data);
    } catch (err) {
      console.error("메뉴 로딩 실패", err);
    }
  };

  /* -----------------------------
     상품 리스트 조회
  ----------------------------- */
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("상품 리스트 불러오기 실패");

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("상품 로딩 실패", err);
    }
  };

  /* -----------------------------
     로그인 체크
  ----------------------------- */
  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });

      setIsLogin(res.ok);
    } catch {
      setIsLogin(false);
    }
  };

  /* -----------------------------
     삭제
  ----------------------------- */
  const handleDelete = async (id: number) => {
    if (!confirm("삭제할까요?")) return;

    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
      });

      fetchProducts();
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  /* -----------------------------
     최초 로딩
  ----------------------------- */
  useEffect(() => {
    fetchMenus(); // ✅ 변경
    fetchProducts();
    checkLogin();
  }, []);

  /* -----------------------------
     3차 카테고리 이름 찾기 함수
  ----------------------------- */
  const findCategoryPath = (categoryId?: number) => {
    if (!categoryId) return "카테고리 없음";

    for (const m1 of menuTree) {
      for (const m2 of m1.children ?? []) {
        for (const m3 of m2.children ?? []) {
          if (m3.id === categoryId) {
            return `${m1.name} / ${m2.name} / ${m3.name}`;
          }
        }
      }
    }
    return "카테고리 없음";
  };

  /* -----------------------------
     모달 열기
  ----------------------------- */
  const openModal = (
    mode: "create" | "edit" | "view",
    productId?: number
  ) => {
    setModalMode(mode);
    setCurrentProductId(productId);
    setShowModal(true);
  };

  return (
    <PageWrapper>
      <SideBar />

      <MainContentWrapper>
        <Header
          onOpenModal={() => openModal("create")}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
        />

        <Content>
          <div className="d-flex justify-content-between my-4">
            <H1>쇼핑몰 관리</H1>
            <Button
              className="me-2"
              variant="outline-primary"
              onClick={onOpenModal}
            >
              상품 등록
            </Button>
          </div>

          <ContentInner>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                onClick={() => openModal("view", p.id)}
              >
                {p.imageUrl && (
                  <ProductImage
                    src={`${API_ROOT}${p.imageUrl}`}
                    alt={p.title}
                  />
                )}

                <ProductDetails>
                  <H5>{p.title}</H5>

                  {/* ✅ nav 메뉴 기준 카테고리 출력 */}
                  <P>{findCategoryPath(p.categoryId)}</P>


{/*add */}
{/* ✅ 사이즈/재고 요약 */}
{(p.sizes?.length ?? 0) > 0 ? (
  <P style={{ margin: "6px 0 0 0" }}>
    <b>사이즈:</b>{" "}
    {p.sizes!
      .slice()
      .sort((a, b) => a.size - b.size)
      .map((s) => `${s.size}(${s.stock})`)
      .join(", ")}
  </P>
) : (
  <P style={{ margin: "6px 0 0 0", color: "#999" }}>
    사이즈 없음
  </P>
)}

{/* ✅ 상품정보고시 요약 (너무 길면 2개만) */}
{(p.specs?.length ?? 0) > 0 ? (
  <P style={{ margin: "6px 0 0 0" }}>
    <b>고시:</b>{" "}
    {p.specs!
      .slice(0, 2)
      .map((sp) => `${sp.label}: ${sp.value}`)
      .join(" / ")}
    {p.specs!.length > 2 ? " ..." : ""}
  </P>
) : (
  <P style={{ margin: "6px 0 0 0", color: "#999" }}>
    상품정보고시 없음
  </P>
)}


                  <Pprice>
                    {p.price.toLocaleString()}원
                  </Pprice>
                </ProductDetails>

                <ButtonGroup>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("edit", p.id);
                    }}
                  >
                    수정
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                  >
                    삭제
                  </Button>
                </ButtonGroup>
              </ProductCard>
            ))}
          </ContentInner>
        </Content>

        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchProducts();
          }}
          productId={currentProductId}
          mode={modalMode}
          isLogin={isLogin}
          categoryList={menuTree} // ✅ 변경
        />
      </MainContentWrapper>
    </PageWrapper>
  );
}