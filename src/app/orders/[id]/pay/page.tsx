"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api from "@/lib/api";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type OrderResponse,
} from "@/types/order";
import "./page.css"; // 상세 페이지와 동일한 디자인 유지

export default function OrderPayPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params?.id);
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // 로그인 및 주문 데이터 로드
        await api.get("/auth/me");
        setIsLogin(true);

        const res = await api.get<OrderResponse>(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (e) {
        console.error("데이터 로드 실패:", e);
        setIsLogin(false);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId]);

  if (loading) return <p className="order-detail-state">결제 정보 확인 중...</p>;
  if (!order) return <p className="order-detail-state">정보를 찾을 수 없습니다.</p>;

  return (
    <main className="order-detail-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="order-detail-container" style={{ textAlign: "center", padding: "40px 20px" }}>
        <div className="order-detail-card">
          <h1 style={{ fontSize: "2rem", color: "#16a34a", marginBottom: "10px" }}>
            🎉 구매가 완료되었습니다!
          </h1>
          
          {/* 결제 완료(PAID) 상태 표시  */}
          <div style={{ marginBottom: "20px" }}>
            <span className={`order-status-badge order-status-badge--${ORDER_STATUS_COLOR['PAID']}`}>
              {ORDER_STATUS_LABEL['PAID']}
            </span>
          </div>

          <div className="order-detail-info" style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <p><strong>주문번호:</strong> {order.orderNo}</p>
            
            {/* 핵심: totalPrice 필드 사용으로 0원 문제 방지  */}
            <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
              최종 결제 금액: <strong style={{ color: "#2563eb" }}>
                {Number(order.totalPrice ?? 0).toLocaleString()}원
              </strong>
            </p>
          </div>
        </div>

        <div className="order-detail-card" style={{ textAlign: "left", marginTop: "20px" }}>
          <h2 className="order-detail-subtitle">배송지 정보</h2>
          <p><strong>수령인:</strong> {order.receiverName}</p>
          <p><strong>주소:</strong> {order.address1} {order.address2}</p>
        </div>

        <button 
          onClick={() => router.push("/products")} 
          className="order-purchase-button"
          style={{ width: "100%", marginTop: "30px", backgroundColor: "#333" }}
        >
          쇼핑 계속하기
        </button>
      </section>

      <Footer />
    </main>
  );
}