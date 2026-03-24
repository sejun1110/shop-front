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
  type OrderStatus,
} from "@/types/order";
import "./page.css";
import Link from "next/link";

// 취소 가능 상태 판별 함수
function canCancel(status: OrderStatus) {
  return status === "PENDING" || status === "PAID";
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params?.id);
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  // 데이터 로드 로직
  useEffect(() => {
    if (!orderId || Number.isNaN(orderId)) {
      setError("잘못된 주문 번호입니다.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        await api.get("/auth/me");
        setIsLogin(true);

        const res = await api.get<OrderResponse>(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "주문 상세를 불러오지 못했습니다.";
        setError(message);
        setIsLogin(false);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId]);

  // 주문 취소 핸들러 (팀원 라우팅 로직 + 기존 안전망 통합)
  // 주문 취소 핸들러
  const handleCancel = async () => {
    if (!order || !canCancel(order.status)) return;
    
    if (!confirm("정말로 주문을 취소하시겠습니까?")) return;

    try {
      setBusy(true);
      
      // 🌟 이 부분을 질문자님의 원래 백엔드 API 주소로 복구했습니다!
      await api.post(`/orders/${orderId}/cancel`); 
      
      alert("주문이 정상적으로 취소되었습니다.");
      // 취소 후 상태 반영을 위해 새로고침 하거나 목록으로 이동
      router.push("/orders"); 
    } catch (e: any) {
      // 진짜 서버 에러가 났을 때 원인을 파악하기 위한 로그
      console.log("취소 에러 원인:", e.response?.data || e.message);
      
      const message = e.response?.data?.message || "주문 취소에 실패했습니다.";
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  // 결제 핸들러
  const handlePayment = async () => {
    try {
      setBusy(true);
      await api.patch(`/orders/${orderId}/status`, { status: "PAID" });
      alert("결제가 완료되었습니다! 감사합니다.");
      window.location.reload(); 
    } catch (e) {
      console.error("결제 API 에러:", e);
      alert("결제 처리 중 문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="order-detail-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="order-detail-container" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>

        {loading ? (
          <p className="order-detail-state">정보를 불러오는 중입니다...</p>
        ) : error ? (
          <p className="order-detail-error">{error}</p>
        ) : !order ? (
          <p className="order-detail-state">주문 정보를 찾을 수 없습니다.</p>
        ) : (
          <>
            {/* 1. 상단 주문 상태 요약 */}
            <div className="order-detail-card" style={{ textAlign: "center", marginBottom: "20px" }}>
              <h1 style={{
                fontSize: "2rem",
                color: order.status === 'CANCELED' ? "#ef4444" : "#16a34a",
                marginBottom: "10px"
              }}>
                {order.status === 'PENDING' && "📝 주문 접수가 완료되었습니다!"}
                {order.status === 'PAID' && "🎉 결제가 완료되었습니다!"}
                {order.status === 'CANCELED' && "❌ 주문이 취소되었습니다."}
                {order.status === 'PREPARING' && "📦 상품을 준비 중입니다!"}
                {order.status === 'SHIPPED' && "🚚 배송이 시작되었습니다!"}
                {order.status === 'COMPLETED' && "🎁 배송이 완료되었습니다!"}
              </h1>
              <div style={{ marginBottom: "20px" }}>
                <span className={`order-status-badge order-status-badge--${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
              <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                최종 결제 금액: <span style={{ color: "#2563eb" }}>
                  {Number((order as any).totalAmount || order.totalPrice || 0).toLocaleString()}원
                </span>
              </p>
            </div>

            {/* 2. 배송 및 주문 정보 */}
            <div className="order-detail-card" style={{ textAlign: "left", marginTop: "20px" }}>
              <h2 className="order-detail-subtitle">배송 및 주문 정보</h2>
              <div className="order-detail-info">
                <p><strong>주문번호:</strong> {order.orderNo || orderId}</p>
                <p><strong>수령인:</strong> {order.receiverName}</p>
                <p><strong>연락처:</strong> {order.receiverPhone}</p>
                <p><strong>우편번호:</strong> {order.zip || "-"}</p>
                <p><strong>주소:</strong> {order.address1} {order.address2 || ""}</p>
                <p><strong>메모:</strong> {order.memo || "-"}</p>
              </div>
            </div>

            {/* 3. 주문 상품 목록 (팀원 0원 해결 로직 포함) */}
            <div className="order-detail-card" style={{ textAlign: "left", marginTop: "20px" }}>
              <h2 className="order-detail-subtitle" style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "15px" }}>주문 상품</h2>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const avgPrice = Number((order as any).totalAmount || order.totalPrice || 0) / (order.items?.length || 1);
                  const unitPrice = Number(item.orderPrice || (item as any).unitPrice || avgPrice);
                              
                  return (
                    <div key={item.orderItemId || index} style={{ borderBottom: "1px solid #ddd", padding: "15px 0" }}>
                      <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{item.productTitle || "주문 상품"}</h3>
                      <div style={{ color: "#666", fontSize: "0.95rem" }}>
                        <span>사이즈: {item.size || "G2"}</span> | <span>단가: {unitPrice.toLocaleString()}원</span> | <span>수량: {item.quantity}개</span>
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "1.1rem" }}>
                        <strong>합계:</strong> <span style={{ color: "#e11d48", fontWeight: "bold" }}>
                          {(unitPrice * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="order-detail-state">주문 상품이 없습니다.</p>
              )}
            </div>

            {/* 4. 결제 유도 액션 & 주문 취소 (PENDING 상태일 때만 등장) */}
            {order.status === 'PENDING' && (
              <div className="order-detail-card" style={{ 
                marginTop: "20px", 
                border: "2px solid #16a34a", 
                backgroundColor: "#f0fdf4", 
                padding: "30px 20px",
                textAlign: "center"
              }}>
                <h2 style={{ color: "#16a34a", marginBottom: "10px" }}>💳 아직 결제 전입니다</h2>
                <p style={{ marginBottom: "20px", color: "#374151" }}>아래 버튼을 눌러 결제를 완료하고 배송을 시작하세요!</p>
                
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={busy}
                  style={{ 
                    width: "100%",  
                    backgroundColor: "#16a34a", 
                    color: "#fff", 
                    padding: "18px", 
                    fontWeight: "bold", 
                    fontSize: "1.2rem",
                    borderRadius: "10px",
                    border: "none", 
                    cursor: busy ? "not-allowed" : "pointer",
                    marginBottom: "12px"
                  }}
                >
                  {busy ? "결제 진행 중..." : `${Number((order as any).totalAmount || order.totalPrice || 0).toLocaleString()}원 결제하기`}
                </button>

                {canCancel(order.status) && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={busy}
                    style={{ 
                      width: "100%",  
                      backgroundColor: "#ef4444", 
                      color: "#fff", 
                      padding: "18px", 
                      fontWeight: "bold", 
                      fontSize: "1.2rem", 
                      borderRadius: "10px", 
                      border: "none", 
                      cursor: busy ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
                    }}
                  >
                    {busy ? "처리 중..." : "주문 취소하기"}
                  </button>
                )}
              </div>
            )}

            {/* 5. 하단 네비게이션 */}
            <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
              <Link href="/products" style={{
                flex: 1, backgroundColor: "#333", color: "#fff", padding: "15px", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontWeight: "bold"
              }}>
                ← 쇼핑 계속하기
              </Link>
              <Link href="/orders" style={{
                flex: 1, backgroundColor: "#fff", color: "#333", padding: "15px", borderRadius: "8px", textAlign: "center", textDecoration: "none", border: "1px solid #ddd", fontWeight: "bold"
              }}>
                주문 목록 보기
              </Link>
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}