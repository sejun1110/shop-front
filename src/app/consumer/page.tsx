"use client";

import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

import Header from "@/include/Header";
import ProductModal from "@/modal/ProductModal";

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

type CategoryNode = {
  id: number;
  name: string;
  children?: CategoryNode[];
};

type Product = {
  id: number;
  title: string;
  desc: string;
  price: number;
  imageUrl?: string;

  // 프론트에서 매핑된 카테고리 구조
  primaryCategory?: { id: number; name: string };
  secondaryCategory?: { id: number; name: string };

  // 서버에서 id 형태로 내려오는 경우를 대비
  primaryCategoryId?: number;
  secondaryCategoryId?: number;
};

export default function Home() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryNode[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentProductId, setCurrentProductId] = useState<number | undefined>(undefined);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const onOpenModal = () => openModal("create");

  // 카테고리 리스트 조회
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
      if (!res.ok) throw new Error("카테고리 로딩 실패");
      const data = await res.json();
      setCategoryList(data);
    } catch (err) {
      console.error("카테고리 로딩 실패", err);
    }
  };

  // 상품 리스트 조회 (카테고리 매핑 포함)
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
      if (!res.ok) throw new Error("상품 리스트 불러오기 실패");
      const data = await res.json();

      const mapped = data.map((p: any) => {
        const primaryId =
          p.primaryCategory?.id ??
          p.primaryCategoryId ??
          p.primaryCategory;

        const secondaryId =
          p.secondaryCategory?.id ??
          p.secondaryCategoryId ??
          p.secondaryCategory;

        const primary = categoryList.find((c) => c.id === primaryId);
        const secondary = primary?.children?.find((c) => c.id === secondaryId);

        return {
          ...p,
          primaryCategory: primary ? { id: primary.id, name: primary.name } : undefined,
          secondaryCategory: secondary ? { id: secondary.id, name: secondary.name } : undefined,
        };
      });

      setProducts(mapped);
    } catch (err) {
      console.error("상품 로딩 실패", err);
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

  // 카테고리 이름 표시
  const getCategoryName = (primaryId?: number, secondaryId?: number) => {
    const primary = categoryList.find(c => c.id === primaryId);
    const secondary = primary?.children?.find(c => c.id === secondaryId);

    if (!primary || !secondary) return "카테고리 없음";
    return `${primary.name} / ${secondary.name}`;
  };

  useEffect(() => {
    fetchCategories();
    checkLogin();
  }, []);

  // 카테고리 로딩 후 상품 재조회
  useEffect(() => {
    if (categoryList.length > 0) {
      fetchProducts();
    }
  }, [categoryList]);

  // 모달 열기
  const openModal = (mode: "create" | "edit" | "view", productId?: number) => {
    setModalMode(mode);
    setCurrentProductId(productId);
    setShowModal(true);
  };

  return (
    <>
      <Header
        onOpenModal={() => openModal("create")}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
      />

      <Container className="py-4">
        <h1>쇼핑몰 메인</h1>              


        <div className="d-flex flex-wrap gap-3 mt-3">
          {products.map(p => (
            <div
              key={p.id}
              className="border p-3 d-flex flex-column justify-content-between"
              style={{ width: 200, height: 320, cursor: "pointer" }}
              onClick={() => openModal("view", p.id)}
            >
              {p.imageUrl && (
                <img
                  src={`${API_ROOT}${p.imageUrl}`}
                  alt={p.title}
                  style={{ width: "100%", height: 140, objectFit: "cover" }}
                />
              )}
              <div>
                <h5 className="mt-2 mb-1">{p.title}</h5>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  {p.primaryCategory && p.secondaryCategory
                    ? `${p.primaryCategory.name} / ${p.secondaryCategory.name}`
                    : "카테고리 없음"}
                </p>
                <p style={{ fontWeight: "bold", marginBottom: 0 }}>
                  {p.price.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* 상품 모달 */}
      <ProductModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          setShowModal(false);
          fetchProducts();
        }}
        productId={currentProductId}
        mode={modalMode}
        isLogin={!!isLogin}
        categoryList={categoryList}
      />
    </>
  );
}
