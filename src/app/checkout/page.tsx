"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api from "@/lib/api";
import { createOrder } from "@/lib/api/orders";
import type { OrderCreateRequest } from "@/types/order";
import "./page.css";

type MeResponse = {
  memberId: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  tel?: string;
  zip?: string;
  address1?: string;
  address2?: string;
};

type CartItem = {
  cartItemId: number;
  skuId?: number | null;
  skuCode?: string | null;
  size?: string | null;

  productId?: number | null;
  productTitle?: string | null;
  productSlug?: string | null;
  imageUrl?: string | null;

  unitPrice?: number | null;
  quantity?: number | null;
  lineAmount?: number | null;

  stockQty?: number | null;
  safetyStockQty?: number | null;
};

type CartResponse = {
  cartId: number;
  memberId: number;
  items: CartItem[];
  totalItemCount?: number | null;
  totalAmount?: number | null;
};

const MEMO_OPTIONS = [
  "문 앞에 놓아주세요",
  "배송 전에 연락해주세요",
  "경비실에 맡겨주세요",
  "직접 입력",
];

function getItemTitle(item: CartItem) {
  return item.productTitle ?? "상품명 없음";
}

function getItemQuantity(item: CartItem) {
  return Number(item.quantity ?? 0);
}

function getItemUnitPrice(item: CartItem) {
  return Number(item.unitPrice ?? 0);
}

function getItemLineAmount(item: CartItem) {
  const direct = Number(item.lineAmount ?? 0);
  if (direct > 0) return direct;
  return getItemUnitPrice(item) * getItemQuantity(item);
}

export default function CheckoutPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoType, setMemoType] = useState("문 앞에 놓아주세요");

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [form, setForm] = useState<OrderCreateRequest>({
    receiverName: "",
    receiverPhone: "",
    zip: "",
    address1: "",
    address2: "",
    memo: "문 앞에 놓아주세요",
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cartRes, meRes] = await Promise.all([
          api.get("/cart"),
          api.get("/members/me"),
        ]);

        console.log("checkout cart response =", cartRes.data);
        console.log("checkout me response =", meRes.data);

        const cartData: CartResponse = cartRes.data;
        const meData: MeResponse = meRes.data;

        setCart(cartData);

        setForm((prev) => ({
          ...prev,
          receiverName:
            meData.name?.trim() ||
            `${meData.lastName ?? ""}${meData.firstName ?? ""}`.trim(),
          receiverPhone: meData.tel ?? "",
          zip: meData.zip ?? "",
          address1: meData.address1 ?? "",
          address2: meData.address2 ?? "",
        }));

        setIsLogin(true);
      } catch (e: any) {
        const status = e?.response?.status;
        const message =
          e?.response?.data?.message ||
          e?.message ||
          "체크아웃 정보를 불러오지 못했습니다.";

        if (status === 401) {
          setError("로그인이 필요합니다.");
          setIsLogin(false);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const finalMemo =
    memoType === "직접 입력" ? form.memo?.trim() || "" : memoType;

  const totalQuantity = useMemo(
    () => (cart?.items ?? []).reduce((sum, item) => sum + getItemQuantity(item), 0),
    [cart]
  );

  const totalAmount = useMemo(() => {
    const apiTotal = Number(cart?.totalAmount ?? 0);
    if (apiTotal > 0) return apiTotal;

    return (cart?.items ?? []).reduce(
      (sum, item) => sum + getItemLineAmount(item),
      0
    );
  }, [cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.receiverName.trim()) {
      alert("수령인 이름을 입력하세요.");
      return;
    }

    if (!form.receiverPhone.trim()) {
      alert("수령인 연락처를 입력하세요.");
      return;
    }

    if (!form.address1.trim()) {
      alert("기본 주소를 입력하세요.");
      return;
    }

    try {
      setBusy(true);
      setError(null);

      const created = await createOrder({
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        zip: form.zip?.trim() || "",
        address1: form.address1.trim(),
        address2: form.address2?.trim() || "",
        memo: finalMemo,
      });

      console.log("created =", created);

      if (!created?.orderId) {
        throw new Error("주문 생성 응답에 orderId가 없습니다.");
      }

      router.push(`/orders/${created.orderId}`);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "주문 생성에 실패했습니다.";

      setError(message);
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="checkout-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="checkout-container">
        <div className="checkout-hero">
          <h1 className="checkout-title">주문 / 결제</h1>
          <p className="checkout-subtitle">
            배송 정보를 확인하고 주문을 완료하세요.
          </p>
        </div>

        {loading ? (
          <div className="checkout-state-card">주문 정보를 불러오는 중...</div>
        ) : error ? (
          <div className="checkout-state-card checkout-error">{error}</div>
        ) : (
          <div className="checkout-layout">
            <form onSubmit={handleSubmit} className="checkout-card">
              <div className="checkout-card-header">
                <h2>배송지 정보</h2>
                <p>회원 정보에 저장된 기본 배송지를 불러왔습니다.</p>
              </div>

              <div className="checkout-grid">
                <div className="checkout-field">
                  <label htmlFor="receiverName">수령인</label>
                  <input
                    id="receiverName"
                    name="receiverName"
                    value={form.receiverName}
                    onChange={handleChange}
                    placeholder="받는 분 이름"
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="receiverPhone">연락처</label>
                  <input
                    id="receiverPhone"
                    name="receiverPhone"
                    value={form.receiverPhone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="zip">우편번호</label>
                  <input
                    id="zip"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="우편번호"
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="address1">기본 주소</label>
                  <input
                    id="address1"
                    name="address1"
                    value={form.address1}
                    onChange={handleChange}
                    placeholder="기본 주소"
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="address2">상세 주소</label>
                  <input
                    id="address2"
                    name="address2"
                    value={form.address2}
                    onChange={handleChange}
                    placeholder="상세 주소"
                  />
                </div>
              </div>

              <div className="checkout-section-divider" />

              <div className="checkout-card-header">
                <h2>배송 요청사항</h2>
                <p>자주 쓰는 요청사항을 선택하거나 직접 입력할 수 있습니다.</p>
              </div>

              <div className="checkout-field">
                <label htmlFor="memoType">배송 메모</label>
                <select
                  id="memoType"
                  value={memoType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMemoType(value);

                    if (value !== "직접 입력") {
                      setForm((prev) => ({ ...prev, memo: value }));
                    } else {
                      setForm((prev) => ({ ...prev, memo: "" }));
                    }
                  }}
                >
                  {MEMO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {memoType === "직접 입력" && (
                <div className="checkout-field">
                  <label htmlFor="memo">직접 입력</label>
                  <textarea
                    id="memo"
                    name="memo"
                    value={form.memo}
                    onChange={handleChange}
                    rows={4}
                    placeholder="배송 기사님께 전달할 내용을 입력하세요."
                  />
                </div>
              )}

              <button type="submit" disabled={busy} className="checkout-submit">
                {busy ? "주문 처리 중..." : "주문하기"}
              </button>
            </form>

            <aside className="checkout-card checkout-summary">
              <div className="checkout-card-header">
                <h2>주문 상품</h2>
                <p>장바구니 기준 주문 요약입니다.</p>
              </div>

              {!cart?.items?.length ? (
                <div className="checkout-empty">장바구니에 상품이 없습니다.</div>
              ) : (
                <div className="checkout-summary-list">
                  {cart.items.map((item) => (
                    <div key={item.cartItemId} className="checkout-summary-item">
                      <div className="checkout-summary-meta">
                        <strong>{getItemTitle(item)}</strong>
                        <span>사이즈: {item.size ?? "-"}</span>
                        <span>수량: {getItemQuantity(item)}</span>
                        <span>
                          단가: {getItemUnitPrice(item).toLocaleString()}원
                        </span>
                      </div>
                      <div className="checkout-summary-price">
                        {getItemLineAmount(item).toLocaleString()}원
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="checkout-total-box">
                <div className="checkout-total-row">
                  <span>총 상품 수</span>
                  <strong>{totalQuantity}개</strong>
                </div>
                <div className="checkout-total-row">
                  <span>총 결제 예정 금액</span>
                  <strong>{totalAmount.toLocaleString()}원</strong>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}