"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/include/Header";
import ProductModal from "@/modal/ProductModal";
import SmallBanner from "./common/SmallBanner";
import { ScrollWrap, TextBanner,TextBanner2, VideoWrap, ImgWrap, ImgTextWrap,
  SpotLight, SpotLightIconWrap, SpotLightIcon
 } from "@/styled/Component.styles";
import { WhiteBtn, BlackBtn, BtnWrap } from "@/styled/Button.styles";
import Footer from "@/include/Footer";
import MainImage from "./common/MainImage";
import MainVideo from "./common/MainVideo";
import TEXTBanner from "./common/TEXTBanner";
import ScrollBanner from "./common/ScrollBanner";
import SpotBanner from "./common/SpotBanner";

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

type MenuNode = {
  id: number;
  name: string;
  children?: MenuNode[];
};

export default function Home() {
  const router = useRouter();
const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentProductId, setCurrentProductId] = useState<number | undefined>(undefined);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
const [categoryList, setCategoryList] = useState<MenuNode[]>([]);

  // 상품 리스트 조회
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
      if (!res.ok) throw new Error("상품 리스트 불러오기 실패");
      const data = await res.json();
      console.log(data); // 상품 데이터 로깅
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

  // 카테고리 이름 표시
  const getCategoryName = (primaryId?: number, secondaryId?: number) => {
    console.log("primaryId:", primaryId, "secondaryId:", secondaryId); // 디버깅용

    const primary = categories.find(c => c.id === primaryId);
    const secondary = primary?.children?.find(c => c.id === secondaryId);

    console.log("Primary:", primary, "Secondary:", secondary); // 디버깅용

    // primary 또는 secondary가 없으면 "카테고리 없음" 출력
    if (!primary || !secondary) return "카테고리 없음";
    return `${primary.name} / ${secondary.name}`;
  };

  //add
  const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/nav-menus/tree`, { cache: "no-store" });
    if (!res.ok) throw new Error("카테고리 로딩 실패");
    const data = await res.json();
    setCategoryList(data);
  } catch (err) {
    console.error("카테고리 로딩 실패", err);
  }
};

  useEffect(() => {
    fetchProducts();

    //add
    fetchCategories();

    checkLogin();
  }, []);

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

{/*슬라이드 배너광고 */}
<SmallBanner/>

<MainImage/>

<TEXTBanner/>

<MainVideo/>

<ScrollBanner/>

<SpotBanner/>

<Footer/>

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

        //add
          isLogin={!!isLogin}             // ✅ 추가 (null 대비)
  categoryList={categoryList}      // ✅ 추가
      />
    </>
  );
}
