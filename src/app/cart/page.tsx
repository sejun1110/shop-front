"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api, { API_ROOT } from "@/lib/api";
import "./cart.css";

type CartItemDTO = {
  cartItemId: number;
  skuId: number;
  skuCode: string;
  size: string;
  productId: number | null;
  productTitle: string | null;
  productSlug: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQty: number;
  safetyStockQty: number;
};

type CartResponseDTO = {
  cartId: number;
  memberId: number;
  items: CartItemDTO[];
  totalItemCount: number;
  totalAmount: number;
};

export default function CartPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadCart = async () => {
    const res = await api.get<CartResponseDTO>("/cart");
    setCart(res.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setPageError(null);

        await api.get("/members/me");
        setIsLogin(true);
        await loadCart();
      } catch (e) {
        setIsLogin(false);
        const message =
          e instanceof Error ? e.message : "장바구니를 불러오지 못했습니다.";
        setPageError(message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleChangeQuantity = async (cartItemId: number, nextQty: number) => {
    if (nextQty < 1) return;

    try {
      setBusyItemId(cartItemId);

      const res = await api.patch<CartResponseDTO>(`/cart/items/${cartItemId}`, {
        quantity: nextQty,
      });

      setCart(res.data);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "수량 변경에 실패했습니다.";
      alert(message);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDeleteItem = async (cartItemId: number) => {
    try {
      setBusyItemId(cartItemId);

      const res = await api.delete<CartResponseDTO>(`/cart/items/${cartItemId}`);
      setCart(res.data);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "상품 삭제에 실패했습니다.";
      alert(message);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleGoOrder = () => {
    if (isLogin !== true) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      alert("장바구니가 비어 있습니다.");
      return;
    }

    router.push("/checkout");
  };

  return (
    <main className="cart-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="cart-container">
        <h1 className="cart-title">장바구니</h1>

        {loading ? (
          <p className="cart-message">장바구니를 불러오는 중...</p>
        ) : isLogin === false ? (
          <div className="cart-empty-box">
            <p className="cart-error">{pageError || "로그인이 필요합니다."}</p>
            <button
              type="button"
              className="cart-primary-btn"
              onClick={() => router.push("/login")}
            >
              로그인하러 가기
            </button>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <p className="cart-message">장바구니에 담긴 상품이 없습니다.</p>
        ) : (
          <>
            <div className="cart-list">
              {cart.items.map((item) => {
                const imgSrc = item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : `${API_ROOT}${item.imageUrl}`
                  : "/no-image.png";

                const maxReached = item.quantity >= (item.stockQty ?? 0);

                return (
                  <div key={item.cartItemId} className="cart-item">
                    <img
                      src={imgSrc}
                      alt={item.productTitle ?? "상품 이미지"}
                      className="cart-item__image"
                    />

                    <div className="cart-item__info">
                      <div className="cart-item__title">
                        {item.productTitle ?? "상품명 없음"}
                      </div>

                      <div className="cart-item__meta">사이즈: {item.size || "-"}</div>
                      <div className="cart-item__meta">SKU: {item.skuCode || "-"}</div>
                      <div className="cart-item__meta">재고: {item.stockQty ?? 0}</div>

                      <div className="cart-item__price">
                        단가: {Number(item.unitPrice ?? 0).toLocaleString()}원
                      </div>

                      <div className="cart-item__amount">
                        합계: {Number(item.lineTotal ?? 0).toLocaleString()}원
                      </div>
                    </div>

                    <div className="cart-item__actions">
                      <div className="cart-qty">
                        <button
                          type="button"
                          className="cart-qty__btn"
                          onClick={() =>
                            handleChangeQuantity(item.cartItemId, item.quantity - 1)
                          }
                          disabled={busyItemId === item.cartItemId || item.quantity <= 1}
                        >
                          -
                        </button>

                        <span className="cart-qty__value">{item.quantity}</span>

                        <button
                          type="button"
                          className="cart-qty__btn"
                          onClick={() =>
                            handleChangeQuantity(item.cartItemId, item.quantity + 1)
                          }
                          disabled={
                            busyItemId === item.cartItemId || maxReached
                          }
                          title={maxReached ? "재고 한도에 도달했습니다." : ""}
                        >
                          +
                        </button>
                      </div>

                      {maxReached && (
                        <div className="cart-item__meta">최대 수량입니다.</div>
                      )}

                      <button
                        type="button"
                        className="cart-danger-btn"
                        onClick={() => handleDeleteItem(item.cartItemId)}
                        disabled={busyItemId === item.cartItemId}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="cart-summary">
              <div>
                <div className="cart-summary__count">
                  총 수량: {cart.totalItemCount}개
                </div>
                <div className="cart-summary__amount">
                  총 금액: {Number(cart.totalAmount ?? 0).toLocaleString()}원
                </div>
              </div>

              <button
                type="button"
                className="cart-primary-btn"
                onClick={handleGoOrder}
              >
                주문하기
              </button>
            </section>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}