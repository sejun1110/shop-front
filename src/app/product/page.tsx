"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Container } from "react-bootstrap";
import ProductModal from "@/modal/ProductModal";

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const router = useRouter();

  const [showModal, setShowModal] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<"consumer" | "developer" | null>(null);

  // 로그인 상태 및 사용자 역할 체크
  const checkUserRole = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("로그인 체크 실패");

      const data = await res.json();
      console.log("🔥 auth/me 응답:", data);

      setIsLogin(true);
      setUserRole(data.role);

      // 로컬 스토리지에 로그인 상태 및 역할 저장
      localStorage.setItem("isLogin", JSON.stringify(true));
      localStorage.setItem("userRole", JSON.stringify(data.role));
    } catch (err) {
      console.log("❌ 로그인 안 됨");
      setIsLogin(false);
      setUserRole("consumer"); // 기본값으로 소비자 역할 설정
    }
  };

  // 상품 정보 가져오기
  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`);
      if (!res.ok) throw new Error("상품 정보 불러오기 실패");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("상품 정보 불러오기 실패", err);
    }
  };

  // 장바구니에 상품 추가
  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingProduct = cart.find((item: any) => item.id === product.id);

    if (existingProduct) {
      alert("이미 장바구니에 추가된 상품입니다.");
    } else {
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("장바구니에 상품을 추가했습니다.");
    }
  };

  // 결제 처리
  const handleCheckout = () => {
    if (isLogin) {
      router.push("/checkout"); // 로그인 상태에서 결제 화면으로 이동
    } else {
      alert("로그인이 필요합니다");
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchProductDetails();
    const storedIsLogin = localStorage.getItem("isLogin");
    const storedUserRole = localStorage.getItem("userRole");

    if (storedIsLogin && storedUserRole) {
      setIsLogin(JSON.parse(storedIsLogin));
      setUserRole(JSON.parse(storedUserRole));
    } else {
      checkUserRole(); // 로컬 스토리지에 없으면 서버에서 로그인 상태를 확인
    }
  }, [productId]);

  if (isNaN(productId)) {
    return <div>잘못된 상품 ID입니다.</div>;
  }

  if (isLogin === null || userRole === null) {
    return <div>로딩 중...</div>; // 로그인과 역할 정보가 아직 설정되지 않았다면 로딩 중 표시
  }

  if (!product) {
    return <div>상품 정보를 불러오는 중입니다...</div>; // 상품 정보 로딩 중 처리
  }

  return (
    <Container>
      <h1>상품 상세</h1>
      <div className="d-flex flex-column align-items-center mt-3">
        <img
          src={`${API_ROOT}${product.imageUrl}`}
          alt={product.title}
          style={{ width: "100%", height: 300, objectFit: "cover" }}
        />
        <h3 className="mt-3">{product.title}</h3>
        <p>{product.desc}</p>
        <p>
          <strong>{product.price.toLocaleString()}원</strong>
        </p>

        {/* 로그인 여부와 역할에 따라 버튼 렌더링 */}
        {isLogin && (
          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={handleAddToCart}>
              장바구니에 담기
            </Button>
            <Button variant="success" onClick={handleCheckout}>
              결제하기
            </Button>
          </div>
        )}

        {/* 개발자일 경우 수정 및 삭제 버튼 표시 */}
        {userRole === "developer" && (
          <div className="d-flex gap-2 mt-3">
            <Button
              variant="warning"
              onClick={() => router.push(`/products/edit/${product.id}`)}
            >
              상품 수정
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("정말 삭제하시겠습니까?")) {
                  // 삭제 로직
                }
              }}
            >
              상품 삭제
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}
