"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, Button, Badge } from "react-bootstrap";
import Header from "@/include/Header";
import { useRouter } from "next/navigation";

const API_ROOT = "http://localhost:9999";
const IMAGE_ROOT = "http://localhost:9999"; // 이미지 서버 다르면 바꾸기

type CartItem = {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  qty: number;
};

type Delivery = {
  deliveryId: string;
  createdAt: string;
  status: "READY" | "SHIPPING" | "DONE";
  address: string;
  paymentMethod: "kakao" | "card";
  totalPrice: number;
  items: CartItem[];
};

const resolveImageSrc = (imageUrl?: string | null) => {
  if (!imageUrl) return "/no-image.png";
  const url = String(imageUrl);
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${IMAGE_ROOT}${url}`;
  return `${IMAGE_ROOT}/${url}`;
};

const statusLabel = (s: Delivery["status"]) => {
  if (s === "READY") return "배송준비중";
  if (s === "SHIPPING") return "배송중";
  return "배송완료";
};

const paymentLabel = (pm: Delivery["paymentMethod"]) => {
  return pm === "kakao" ? "카카오페이" : "신용카드";
};

export default function DeliveryPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  // 로그인 상태(로컬 기준 - Header용)
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLogin(!!user);
  }, []);

  // ✅ delivery_current 로드
  useEffect(() => {
    const saved = localStorage.getItem("delivery_current");
    if (!saved) {
      setDelivery(null);
      return;
    }
    try {
      const parsed = JSON.parse(saved);

      const normalized: Delivery = {
        deliveryId: String(parsed.deliveryId ?? `D-${Date.now()}`),
        createdAt: String(parsed.createdAt ?? new Date().toISOString()),
        status: (parsed.status === "SHIPPING" || parsed.status === "DONE" ? parsed.status : "READY"),
        address: String(parsed.address ?? ""),
        paymentMethod: parsed.paymentMethod === "kakao" ? "kakao" : "card",
        totalPrice: Number(parsed.totalPrice ?? 0),
        items: (Array.isArray(parsed.items) ? parsed.items : []).map((it: any) => ({
          id: Number(it.id),
          title: String(it.title ?? ""),
          price: Number(it.price ?? 0),
          imageUrl: it.imageUrl ?? null,
          qty: Math.max(1, Number(it.qty ?? 1)),
        })),
      };

      setDelivery(normalized);
    } catch {
      setDelivery(null);
    }
  }, []);

  const computedTotal = useMemo(() => {
    if (!delivery) return 0;
    // 혹시 totalPrice가 0으로 저장되었을 때를 대비해서 items 합계도 계산
    const sum = delivery.items.reduce((acc, it) => acc + it.price * it.qty, 0);
    return delivery.totalPrice > 0 ? delivery.totalPrice : sum;
  }, [delivery]);

  if (!delivery) {
    return (
      <>
        <Header isLogin={isLogin} setIsLogin={setIsLogin} onOpenModal={() => {}} />
        <Container className="py-4">
          <h1>배송 조회</h1>
          <p className="text-muted">현재 배송 정보가 없습니다.</p>
          <Button onClick={() => router.push("/cart")}>장바구니로</Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header isLogin={isLogin} setIsLogin={setIsLogin} onOpenModal={() => {}} />

      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="m-0">배송 조회</h1>
          <Badge bg="secondary">{statusLabel(delivery.status)}</Badge>
        </div>

        <div className="border rounded p-3 mt-3">
          <div className="mb-2">
            <b>주문번호</b> : {delivery.deliveryId}
          </div>
          <div className="mb-2">
            <b>주소</b> : {delivery.address || "(주소 없음)"}
          </div>
          <div className="mb-2">
            <b>결제수단</b> : {paymentLabel(delivery.paymentMethod)}
          </div>
          <div className="mb-0">
            <b>총 결제금액</b> : {computedTotal.toLocaleString()}원
          </div>
        </div>

        <h5 className="mt-4">주문 상품</h5>
        {delivery.items.map((item) => (
          <div key={item.id} className="border p-3 mb-3 d-flex gap-3">
            <img
              src={resolveImageSrc(item.imageUrl)}
              alt={item.title}
              style={{ width: 80, height: 80, objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/no-image.png";
              }}
            />
            <div>
              <div>{item.title}</div>
              <div>
                {item.price.toLocaleString()}원 x {item.qty} ={" "}
                {(item.price * item.qty).toLocaleString()}원
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => router.push("/")}>
            쇼핑 계속하기
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => {
              localStorage.removeItem("delivery_current");
              router.push("/cart");
            }}
          >
            배송정보 삭제(테스트)
          </Button>
        </div>
      </Container>
    </>
  );
}
