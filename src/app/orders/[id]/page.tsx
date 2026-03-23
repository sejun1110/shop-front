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
import "./page.css";

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
        await api.get("/members/me");
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
        {/* 상단 요약 카드 */}
        <div className="order-detail-card">
          <h1 style={{ fontSize: "2rem", color: "#16a34a", marginBottom: "10px" }}>
            🎉 구매가 완료되었습니다!
          </h1>
          
          <div style={{ marginBottom: "20px" }}>
            <span className={`order-status-badge order-status-badge--${ORDER_STATUS_COLOR['PAID']}`}>
              {ORDER_STATUS_LABEL['PAID']}
            </span>
          </div>

          <div className="order-detail-info" style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <p><strong>주문번호:</strong> {order.orderNo}</p>
            <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
              최종 결제 금액: <strong style={{ color: "#2563eb" }}>
                {Number(order.totalPrice ?? 0).toLocaleString()}원
              </strong>
            </p>
          </div>
        </div>

        <div className="order-detail-card" style={{ textAlign: "left", marginTop: "20px" }}>
          <h2 className="order-detail-subtitle" style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "15px" }}>
            주문 상품
          </h2>
          
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} style={{ borderBottom: "1px solid #ddd", padding: "15px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* 1. 상품명 */}
                <h3 style={{ fontSize: "1.1rem", margin: "0", color: "#111" }}>
                  {item.productTitle || "상품명 없음"}
                </h3>
                
                {/* 2. 사이즈 & 3. SKU */}
                <div style={{ color: "#555", fontSize: "0.95rem" }}>
                  <span style={{ marginRight: "15px" }}><strong>사이즈:</strong> {item.size || "정보 없음"}</span>
                  <span><strong>SKU:</strong> {item.skuCode || "정보 없음"}</span>
                </div>
                
                {/* 4. 주문가격 & 5. 수량 */}
                <div style={{ color: "#555", fontSize: "0.95rem" }}>
                  <span style={{ marginRight: "15px" }}><strong>주문가격:</strong> {Number(item.orderPrice || 0).toLocaleString()}원</span>
                  <span><strong>수량:</strong> {item.quantity || 0}개</span>
                </div>
                
                {/* 6. 합계 (0원 에러 해결 완료! 수량 * 단가) */}
                <div style={{ marginTop: "5px", fontSize: "1.1rem" }}>
                  <strong>합계:</strong> <span style={{ color: "#e11d48", fontWeight: "bold" }}>
                    {Number((item.orderPrice * item.quantity) || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888", textAlign: "center", padding: "20px 0" }}>주문 상품 정보가 없습니다.</p>
          )}
        </div>
      

        {/* 배송지 정보 카드 */}
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