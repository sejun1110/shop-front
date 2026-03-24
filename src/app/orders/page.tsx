"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api from "@/lib/api";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type OrderListItemResponse,
} from "@/types/order";
import "./page.css";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  // 1. 주문 목록 로드
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        await api.get("/auth/me");
        setIsLogin(true);

        const res = await api.get<OrderListItemResponse[]>("/orders");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "주문 목록을 불러오지 못했습니다.";
        setError(message);
        setIsLogin(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 2. [추가] 주문하기 버튼 클릭 시 로직 (재고 부족 실패 처리 포함)
  const handleCreateOrder = async (orderRequestData: any) => {
    try {
      // 주문 생성 API 호출 (API-008)
      const res = await api.post("/orders", orderRequestData);

      if (res.status === 200 || res.status === 201) {
        alert("주문이 성공적으로 완료되었습니다!");
        router.push("/orders/post"); // 또는 "/orders/success"
      }
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || "주문 처리 중 오류가 발생했습니다.";

      // 1. 에러 메시지 표시
      alert(`주문 실패: ${errorMessage}`);

      // 2. 현재 페이지(주문서/상세) 유지
      console.error("Order Failure:", e);
    }
  };

  return (
    <main className="orders-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="orders-container">
        <h1 className="orders-title">내 주문 목록</h1>

        {/* 프로젝트용: 주문 생성 테스트 버튼 (필요시 UI에 배치) */}
        {/* <button onClick={() => handleCreateOrder({...})}>테스트 주문하기</button> */}

        {loading ? (
          <p className="orders-state">주문 목록 불러오는 중...</p>
        ) : error ? (
          <p className="orders-error">{error}</p>
        ) : orders.length === 0 ? (
          <p className="orders-state">주문 내역이 없습니다.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <button
                key={order.orderId}
                type="button"
                className="order-card"
                onClick={() => router.push(`/orders/${order.orderId}`)}
              >
                <div className="order-card__grid">
                  <div>
                    <div className="order-card__label">주문번호</div>
                    <div className="order-card__value order-card__value--strong">
                      {order.orderNo || order.orderId}
                    </div>
                  </div>

                  <div>
                    <div className="order-card__label">상태</div>
                    <div
                      className={`order-status-badge order-status-badge--${ORDER_STATUS_COLOR[order.status]}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </div>
                  </div>

                  <div>
                    <div className="order-card__label">수령인</div>
                    <div className="order-card__value">{order.receiverName}</div>
                  </div>

                  <div>
                    <div className="order-card__label">총금액</div>
                    <div className="order-card__value order-card__value--strong">
                      {/* 상세 페이지와 동일하게 0원 방지 로직 적용 */}
                      {Number((order as any).totalAmount || order.totalPrice || 0).toLocaleString()}원
                    </div>
                  </div>

                  <div>
                    <div className="order-card__label">생성일</div>
                    <div className="order-card__value">
                      {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}