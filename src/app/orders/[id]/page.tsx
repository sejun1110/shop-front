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

  // 데이터 로드 로직 (본인 코드 기반: 에러 핸들링이 더 견고함)
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

        await api.get("/auth/me"); // 혹은 본인/팀원 로직에 맞게 "/members/me" 사용
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

  // 주문 취소 핸들러 (본인 코드)
  const handleCancel = async () => {
    if (!order || !canCancel(order.status)) return;

    const ok = confirm("이 주문을 취소할까요?");
    if (!ok) return;

    try {
      setBusy(true);
      const res = await api.post<OrderResponse>(`/orders/${order.orderId}/cancel`);
      setOrder(res.data);
      alert("주문이 취소되었습니다.");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "주문 취소에 실패했습니다.";
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  // 결제 핸들러 (팀원 코드 기반 구조화)
  const handlePayment = async () => {
    try {
      setBusy(true);
      await api.patch(`/orders/${orderId}/status`, { status: "PAID" });
      alert("결제가 완료되었습니다! 감사합니다.");
      window.location.reload(); // 리팩토링 시 router.refresh() 또는 상태 업데이트로 변경 권장
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
            {/* 1. 상단 주문 상태 요약 (팀원 코드 통합) */}
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
                  {Number(order.totalPrice ?? 0).toLocaleString()}원
                </span>
              </p>
            </div>

            {/* 2. 결제 유도 액션 (팀원 코드 통합) */}
            {order.status === 'PENDING' && (
              <div className="order-detail-card" style={{
                marginBottom: "20px", border: "2px solid #16a34a", backgroundColor: "#f0fdf4", padding: "30px 20px", textAlign: "center"
              }}>
                <h2 style={{ color: "#16a34a", marginBottom: "10px" }}>💳 아직 결제 전입니다</h2>
                <p style={{ marginBottom: "20px", color: "#374151" }}>아래 버튼을 눌러 결제를 완료하고 배송을 시작하세요!</p>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={busy}
                  style={{
                    width: "100%", backgroundColor: "#16a34a", color: "#fff", padding: "18px", fontWeight: "bold", fontSize: "1.2rem", borderRadius: "10px", border: "none", cursor: busy ? "not-allowed" : "pointer"
                  }}
                >
                  {busy ? "결제 진행 중..." : `${Number(order.totalPrice ?? 0).toLocaleString()}원 결제하기`}
                </button>
              </div>
            )}

            {/* 3. 주문 상세 정보 (본인 코드 기반) */}
            <div className="order-detail-card">
              <h2 className="order-detail-subtitle">배송 및 주문 정보</h2>
              <div className="order-detail-info">
                <div><strong>주문번호:</strong> {order.orderNo}</div>
                <div><strong>수령인:</strong> {order.receiverName}</div>
                <div><strong>연락처:</strong> {order.receiverPhone}</div>
                <div><strong>우편번호:</strong> {order.zip || "-"}</div>
                <div><strong>주소:</strong> {order.address1} {order.address2 || ""}</div>
                <div><strong>메모:</strong> {order.memo || "-"}</div>
              </div>

              {/* 주문 취소 버튼 (본인 코드) */}
              {canCancel(order.status) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy}
                  className="order-cancel-button"
                  style={{ marginTop: "15px", width: "100%" }}
                >
                  {busy ? "처리 중..." : "주문 취소"}
                </button>
              )}
            </div>

            {/* 4. 주문 상품 목록 (본인 코드 기반 - 하드코딩 제거) */}
            <div className="order-detail-card">
              <h2 className="order-detail-subtitle">주문 상품</h2>
              {order.items.length === 0 ? (
                <p className="order-detail-state">주문 상품이 없습니다.</p>
              ) : (
                <div className="order-item-list">
                  {order.items.map((item) => (
                    <div key={item.orderItemId} className="order-item-card" style={{ borderBottom: "1px solid #ddd", padding: "15px 0" }}>
                      <div style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: "bold" }}>
                        {item.productTitle ?? "-"}
                      </div>
                      <div style={{ color: "#666", fontSize: "0.95rem" }}>
                        <span>사이즈: {item.size}</span> | <span>SKU: {item.skuCode}</span>
                      </div>
                      <div style={{ color: "#666", fontSize: "0.95rem", marginTop: "4px" }}>
                        <span>단가: {Number(item.orderPrice ?? 0).toLocaleString()}원</span> | <span>수량: {item.quantity}개</span>
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "1.1rem" }}>
                        <strong>합계:</strong> <span style={{ color: "#e11d48", fontWeight: "bold" }}>
                          {Number(item.lineAmount ?? 0).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. 하단 네비게이션 (팀원 코드 통합) */}
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