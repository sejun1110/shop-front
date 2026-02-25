"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, Button, Form } from "react-bootstrap";
import Header from "@/include/Header";
import { useRouter } from "next/navigation";

const API_ROOT = "http://localhost:9999";      // 주문/API 서버
const IMAGE_ROOT = "http://localhost:9999";    // 이미지 서버 다르면 8888 등으로 변경
const API_BASE = `${API_ROOT}/api`;

declare global {
  interface Window {
    daum: any;
  }
}

type CartItem = {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  qty: number;
};

type OrderDetails = {
  address: string;
  detailAddress: string;
  paymentMethod: "kakao" | "card";
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

export default function OrderPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    address: "",
    detailAddress: "",
    paymentMethod: "card",
  });

  // =========================
  // 이미지 경로 보정
  // =========================
  const resolveImageSrc = (imageUrl?: string | null) => {
    if (!imageUrl) return "/no-image.png";
    const url = String(imageUrl);

    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${IMAGE_ROOT}${url}`;
    return `${IMAGE_ROOT}/${url}`;
  };

  // =========================
  // 장바구니 로드
  // =========================
  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) {
      setCart([]);
      return;
    }
    try {
      const parsed = JSON.parse(savedCart);
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
  // 로그인 체크 (/auth/me)
  // =========================
  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      setIsLogin(res.ok);
      return res.ok;
    } catch {
      setIsLogin(false);
      return false;
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  // =========================
  // pm 쿼리 반영
  // =========================
  useEffect(() => {
    const url = new URL(window.location.href);
    const pm = url.searchParams.get("pm");
    if (pm === "kakao" || pm === "card") {
      setOrderDetails((prev) => ({ ...prev, paymentMethod: pm }));
    }
  }, []);

  // =========================
  // 총 금액
  // =========================
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  // =========================
  // 입력 변경
  // =========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "paymentMethod") {
      const v = value === "kakao" ? "kakao" : "card";
      setOrderDetails((prev) => ({ ...prev, paymentMethod: v }));
      return;
    }

    setOrderDetails((prev) => ({ ...prev, [name]: value }));
  };

  // =========================
  // 다음 주소 API
  // =========================
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.postcode) {
      alert("주소 API 로딩 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setOrderDetails((prev) => ({
          ...prev,
          address: data.address ?? "",
        }));
      },
    }).open();
  };

  // =========================
  // 주문 처리
  // =========================
  const handlePlaceOrder = async () => {
    const ok = await checkLogin();
    if (!ok) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (cart.length === 0) {
      alert("장바구니가 비었습니다.");
      return;
    }

    if (!orderDetails.address.trim()) {
      alert("주소검색을 해주세요.");
      return;
    }

    if (!orderDetails.detailAddress.trim()) {
      alert("상세주소를 입력하세요.");
      return;
    }

    const fullAddress = `${orderDetails.address} ${orderDetails.detailAddress}`.trim();

    // Delivery 생성 (로컬 저장)
    const delivery: Delivery = {
      deliveryId: `D-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "READY",
      address: fullAddress,
      paymentMethod: orderDetails.paymentMethod,
      totalPrice,
      items: cart,
    };

    localStorage.setItem("delivery_current", JSON.stringify(delivery));

    // 장바구니 비우기
    localStorage.setItem("cart", JSON.stringify([]));
    setCart([]);

    // 배송 페이지 이동
    router.push("/delivery");
  };

  return (
    <>
      {/* ✅ 다음 주소 스크립트 */}
      <script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
      />

      <Header isLogin={isLogin} setIsLogin={setIsLogin} onOpenModal={() => {}} />

      <Container className="py-4">
        <h1>주문 정보</h1>

        {cart.map((item) => (
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
                {item.price.toLocaleString()}원 x {item.qty}
              </div>
            </div>
          </div>
        ))}

        <h4 className="text-end">총 금액: {totalPrice.toLocaleString()}원</h4>

        <Form>
          <Form.Group className="mt-3">
            <Form.Label>주소</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control readOnly value={orderDetails.address} />
              <Button type="button" onClick={handleAddressSearch}>
                주소검색
              </Button>
            </div>
          </Form.Group>

          <Form.Control
            className="mt-2"
            placeholder="상세주소"
            name="detailAddress"
            value={orderDetails.detailAddress}
            onChange={(e) => handleChange(e as any)}
          />

          <Form.Select
            className="mt-3"
            name="paymentMethod"
            value={orderDetails.paymentMethod}
            onChange={(e) => handleChange(e as any)}
          >
            <option value="card">신용카드</option>
            <option value="kakao">카카오페이</option>
          </Form.Select>

          <Button className="mt-4" type="button" onClick={handlePlaceOrder}>
            주문하기
          </Button>
        </Form>
      </Container>
    </>
  );
}
