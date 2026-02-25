"use client";

import { useState, useEffect, useMemo } from "react";
import { Container, Button } from "react-bootstrap";
import Header from "@/include/Header";

import ProductModal from "@/modal/ProductModal";
import CheckoutModal from "@/modal/CheckoutModal";

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

type CartItem = {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  qty: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  // ✅ 상세 모달 상태
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);

  // ✅ 결제 모달 상태
  const [showCheckout, setShowCheckout] = useState(false);

  // =========================
  // 장바구니 로드/정규화
  // =========================
  const loadCart = () => {
    const saved = localStorage.getItem("cart");
    if (!saved) {
      setCart([]);
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      const normalized: CartItem[] = (Array.isArray(parsed) ? parsed : []).map((item: any) => ({
        id: Number(item.id),
        title: String(item.title ?? ""),
        price: Number(item.price ?? 0),
        imageUrl: item.imageUrl ?? null,
        qty: Math.max(1, Number(item.qty ?? 1)),
      }));
      setCart(normalized);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // =========================
  // ✅ 로그인 상태 확인 (/auth/me)
  // =========================
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        setIsLogin(res.ok);
      } catch (err) {
        console.error("로그인 체크 실패", err);
        setIsLogin(false);
      }
    };
    checkLogin();
  }, []);

  // =========================
  // 수량 변경
  // =========================
  const handleQtyChange = (productId: number, delta: number) => {
    const updated = cart.map((item) => {
      if (item.id === productId) {
        const newQty = Math.max(1, (item.qty || 1) + delta);
        return { ...item, qty: newQty };
      }
      return item;
    });

    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  // =========================
  // 삭제
  // =========================
  const handleRemoveFromCart = (productId: number) => {
    const updated = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  // =========================
  // 총 금액
  // =========================
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  }, [cart]);

  // =========================
  // 결제 버튼
  // =========================
  const handleCheckout = () => {
    if (isLogin !== true) {
      alert("로그인이 필요합니다.");
      return;
    }
    setShowCheckout(true);
  };

  // =========================
  // 보기(상세) 모달
  // =========================
  const handleOpenDetail = (productId: number) => {
    setSelectedProductId(productId);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedProductId(undefined);
  };

  // ✅ 모달에서 장바구니 담기 등이 일어나면 cart 다시 읽기
  const reloadCartFromStorage = () => {
    loadCart();
  };

  return (
    <>
      <Header isLogin={isLogin} setIsLogin={setIsLogin} onOpenModal={() => {}} />

      {/* ✅ 상세 모달 */}
      <ProductModal
        show={showDetail}
        onClose={handleCloseDetail}
        onSaved={reloadCartFromStorage}
        productId={selectedProductId}
        mode="view"
        isLogin={!!isLogin}
      />

      {/* ✅ 결제 모달 */}
      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        totalPrice={totalPrice}
        isLogin={!!isLogin}
        onPaid={() => {
          // 여기서는 실제 결제 성공 처리 대신,
          // 결제수단 선택 후 /orders 로 이동하도록 CheckoutModal에서 처리함.
        }}
      />

      <Container className="py-4">
        <h1>장바구니</h1>

        {cart.length === 0 ? (
          <p>장바구니에 담긴 상품이 없습니다.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                className="d-flex justify-content-between align-items-center border p-3 mb-3"
              >
                <img
                  src={
                    item.imageUrl?.startsWith("http")
                      ? item.imageUrl
                      : item.imageUrl
                        ? `${API_ROOT}${item.imageUrl}`
                        : "/no-image.png"
                  }
                  alt={item.title}
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />

                <div style={{ flex: 1, marginLeft: 20 }}>
                  <h5 className="mb-1">{item.title}</h5>

                  <p className="mb-1">{Number(item.price).toLocaleString()}원</p>

                  {/* 수량 조절 */}
                  <div className="d-flex align-items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleQtyChange(item.id, -1)}>
                      -
                    </Button>

                    <span style={{ minWidth: 30, textAlign: "center" }}>{item.qty || 1}</span>

                    <Button size="sm" variant="secondary" onClick={() => handleQtyChange(item.id, +1)}>
                      +
                    </Button>
                  </div>

                  {/* 소계 */}
                  <p className="mt-2 mb-0">
                    소계: {(Number(item.price) * (Number(item.qty) || 1)).toLocaleString()}원
                  </p>
                </div>

                {/* 오른쪽 버튼 영역 */}
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => handleOpenDetail(item.id)}>
                    보기
                  </Button>

                  <Button variant="danger" size="sm" onClick={() => handleRemoveFromCart(item.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 text-end">
              <h4>총 금액: {totalPrice.toLocaleString()}원</h4>
              <Button variant="success" onClick={handleCheckout}>
                결제하기
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
