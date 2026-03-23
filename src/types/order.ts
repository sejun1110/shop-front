export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "주문접수",
  PAID: "결제완료",
  PREPARING: "상품준비중",
  SHIPPED: "배송중",
  COMPLETED: "배송완료",
  CANCELED: "주문취소",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "gray",
  PAID: "blue",
  PREPARING: "orange",
  SHIPPED: "blue",
  COMPLETED: "green",
  CANCELED: "red",
};

export type OrderCreateRequest = {
  receiverName: string;
  receiverPhone: string;
  zip?: string;
  address1: string;
  address2?: string;
  memo?: string;
};

export type OrderItemResponse = {
  orderItemId: number;
  skuId: number;
  skuCode: string;
  size: string;
  productId: number | null;
  productTitle: string | null;
  orderPrice: number;
  quantity: number;
  lineAmount: number;
};

export type OrderListItemResponse = {
  orderId: number;
  orderNo: string;
  status: OrderStatus;
  totalPrice: number;
  receiverName: string;
  createdAt: string;
};

export type OrderResponse = {
  orderId: number;
  orderNo: string;
  status: OrderStatus;
  totalPrice: number;
  receiverName: string;
  receiverPhone: string;
  zip: string | null;
  address1: string;
  address2: string | null;
  memo: string | null;
  items: OrderItemResponse[];
};

