"use client";

import { Modal, Button } from "react-bootstrap";

type Props = {
  show: boolean;
  onClose: () => void;
  totalPrice: number;
  isLogin: boolean;
  /** 선택: 결제 시작 후 성공/실패 처리 */
  onPaid?: () => void;
};

export default function CheckoutModal({ show, onClose, totalPrice, isLogin, onPaid }: Props) {
  const requireLogin = () => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      return false;
    }
    return true;
  };

  // ✅ 결제수단 선택 → 주문페이지(/orders)로 이동 (수단을 쿼리로 전달)
  const goOrders = (pm: "kakao" | "card") => {
    if (!requireLogin()) return;

    // 장바구니는 이미 localStorage(cart)에 qty 포함으로 저장되어 있으니
    // /orders에서는 그걸 그대로 읽으면 됨.
    onPaid?.();
    onClose();

    window.location.href = `/orders?pm=${pm}`;
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>결제하기</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-2" style={{ fontWeight: 700, fontSize: 18 }}>
          결제 금액: {totalPrice.toLocaleString()}원
        </div>
        <div className="text-muted" style={{ fontSize: 13 }}>
          결제 수단을 선택하세요.
        </div>

        <div className="d-grid gap-2 mt-4">
          <Button variant="warning" onClick={() => goOrders("kakao")}>
            카카오페이로 결제하기
          </Button>

          <Button variant="primary" onClick={() => goOrders("card")}>
            신용카드로 결제하기
          </Button>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
