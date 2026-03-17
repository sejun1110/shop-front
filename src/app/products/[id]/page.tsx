"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api, { API_ROOT } from "@/lib/api";
import type { ProductDetail } from "@/types/product";
import "./page.css";

type CartItemDTO = {
  cartItemId: number;
  skuId: number;
  skuCode: string;
  size: string;
  productId: number | null;
  productTitle: string | null;
  productSlug: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQty: number;
  safetyStockQty: number;
};

type CartResponseDTO = {
  cartId: number;
  memberId: number;
  items: CartItemDTO[];
  totalItemCount: number;
  totalAmount: number;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    const res = await api.get<CartResponseDTO>("/cart");
    setCart(res.data);
    return res.data;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        let loggedIn = false;

        try {
          await api.get("/members/me");
          setIsLogin(true);
          loggedIn = true;
        } catch {
          setIsLogin(false);
        }

        const productRes = await api.get<ProductDetail>(`/products/${id}`);
        const data = productRes.data;
        setProduct(data);

        if (data.sizes && data.sizes.length > 0) {
          setSelectedSkuId(data.sizes[0].id);
        }

        if (loggedIn) {
          await loadCart();
        } else {
          setCart(null);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "상품 상세 조회 실패";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      init();
    }
  }, [id]);

  const selectedSize = useMemo(() => {
    return product?.sizes?.find((size) => size.id === selectedSkuId) ?? null;
  }, [product, selectedSkuId]);

  const resolvedImageUrl = useMemo(() => {
    if (!product?.imageUrl) return "/no-image.png";
    if (product.imageUrl.startsWith("http")) return product.imageUrl;
    return `${API_ROOT}${product.imageUrl}`;
  }, [product]);

  const currentCartQty = useMemo(() => {
    if (!selectedSkuId || !cart?.items?.length) return 0;
    return cart.items.find((item) => item.skuId === selectedSkuId)?.quantity ?? 0;
  }, [cart, selectedSkuId]);

  const selectedStockQty = selectedSize?.stock ?? 0;
  const remainingQty = Math.max(selectedStockQty - currentCartQty, 0);
  const soldOut = selectedStockQty < 1;
  const reachedCartLimit = !soldOut && currentCartQty >= selectedStockQty;

  const progressWidth = useMemo(() => {
    if (selectedStockQty <= 0) return 0;
    return Math.min((currentCartQty / selectedStockQty) * 100, 100);
  }, [currentCartQty, selectedStockQty]);

  const addButtonText = useMemo(() => {
    if (busy) return "처리 중...";
    if (!selectedSize) return "사이즈 선택";
    if (soldOut) return "품절";
    if (reachedCartLimit) return "이미 최대 수량 담김";
    return "장바구니 담기";
  }, [busy, selectedSize, soldOut, reachedCartLimit]);

  const stockBadgeText = useMemo(() => {
    if (soldOut) return "품절";
    if (reachedCartLimit) return "최대 수량 도달";
    return `추가 가능 ${remainingQty}개`;
  }, [soldOut, reachedCartLimit, remainingQty]);

  const stockBadgeClassName = useMemo(() => {
    if (soldOut) return "product-detail-stock-badge is-soldout";
    if (reachedCartLimit) return "product-detail-stock-badge is-limit";
    return "product-detail-stock-badge is-available";
  }, [soldOut, reachedCartLimit]);

  const addToCart = async () => {
    if (isLogin !== true) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      alert("사이즈를 선택하세요.");
      return;
    }

    if (soldOut) {
      alert("재고가 없습니다.");
      return;
    }

    if (reachedCartLimit) {
      alert("이미 최대 수량이 담겨 있습니다.");
      return;
    }

    try {
      setBusy(true);

      await api.post("/cart/items", {
        skuId: selectedSize.id,
        quantity: 1,
      });

      await loadCart();
      alert("장바구니에 담았습니다.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "장바구니 담기 실패";
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  const goToCart = () => {
    if (isLogin !== true) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    router.push("/cart");
  };

  return (
    <main className="product-detail-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="product-detail-section">
        <div className="product-detail-back">
          <Link href="/products">← 상품 목록으로</Link>
        </div>

        {loading ? (
          <p className="product-detail-state">상품 정보를 불러오는 중...</p>
        ) : error ? (
          <p className="product-detail-error">{error}</p>
        ) : !product ? (
          <p className="product-detail-state">상품 정보를 찾을 수 없습니다.</p>
        ) : (
          <>
            <div className="product-detail-layout">
              <div className="product-detail-visual">
                <img src={resolvedImageUrl} alt={product.title} />
              </div>

              <div className="product-detail-info">
                <div className="product-detail-brand">
                  {product.brandName ?? "브랜드 없음"}
                </div>

                <h1 className="product-detail-title">{product.title}</h1>

                <div className="product-detail-sub">
                  {product.series || product.categoryName || "-"}
                </div>

                <div className="product-detail-price">
                  {Number(product.price ?? 0).toLocaleString()}원
                </div>

                <div className="product-detail-size-block">
                  <div className="product-detail-size-label">그립 사이즈</div>

                  {!product.sizes || product.sizes.length === 0 ? (
                    <p className="product-detail-empty-text">
                      선택 가능한 사이즈가 없습니다.
                    </p>
                  ) : (
                    <>
                      <div className="product-detail-size-list">
                        {product.sizes.map((size) => {
                          const active = selectedSkuId === size.id;
                          const sizeSoldOut = (size.stock ?? 0) < 1;

                          return (
                            <button
                              key={size.id}
                              type="button"
                              className={`product-detail-size-btn ${
                                active ? "is-active" : ""
                              } ${sizeSoldOut ? "is-disabled" : ""}`}
                              onClick={() => setSelectedSkuId(size.id)}
                              disabled={sizeSoldOut}
                            >
                              {size.size} / 재고 {size.stock}
                            </button>
                          );
                        })}
                      </div>

                      {selectedSize && (
                        <div className="product-detail-stock-panel">
                          <div className="product-detail-stock-panel__top">
                            <div className="product-detail-stock-panel__title">
                              구매 가능 상태
                            </div>

                            <div className={stockBadgeClassName}>
                              {stockBadgeText}
                            </div>
                          </div>

                          <div className="product-detail-stock-stats">
                            <div className="product-detail-stock-stat">
                              <span className="product-detail-stock-stat__label">
                                재고
                              </span>
                              <strong className="product-detail-stock-stat__value">
                                {selectedStockQty}
                              </strong>
                            </div>

                            <div className="product-detail-stock-stat">
                              <span className="product-detail-stock-stat__label">
                                담은 수량
                              </span>
                              <strong className="product-detail-stock-stat__value">
                                {currentCartQty}
                              </strong>
                            </div>

                            <div className="product-detail-stock-stat">
                              <span className="product-detail-stock-stat__label">
                                추가 가능
                              </span>
                              <strong className="product-detail-stock-stat__value">
                                {remainingQty}
                              </strong>
                            </div>
                          </div>

                          <div className="product-detail-stock-progress">
                            <div
                              className="product-detail-stock-progress__bar"
                              style={{ width: `${progressWidth}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="product-detail-actions">
                  <button
                    type="button"
                    className="product-detail-btn product-detail-btn--ghost"
                    onClick={addToCart}
                    disabled={busy || !selectedSize || soldOut || reachedCartLimit}
                  >
                    {addButtonText}
                  </button>

                  <button
                    type="button"
                    className="product-detail-btn product-detail-btn--primary"
                    onClick={goToCart}
                    disabled={busy}
                  >
                    {busy ? "처리 중..." : "장바구니로 이동"}
                  </button>
                </div>

                <div className="product-detail-desc">
                  {product.description || "상품 설명이 없습니다."}
                </div>
              </div>
            </div>

            <section className="product-spec-section">
              <h2 className="product-spec-title">스펙</h2>

              {!product.spec ? (
                <p className="product-detail-empty-text">스펙 정보가 없습니다.</p>
              ) : (
                <div className="product-spec-grid">
                  <SpecCard
                    label="Head Size"
                    value={
                      product.spec.headSizeSqIn
                        ? `${product.spec.headSizeSqIn} sq in`
                        : "-"
                    }
                  />
                  <SpecCard
                    label="Weight"
                    value={
                      product.spec.unstrungWeightG
                        ? `${product.spec.unstrungWeightG} g`
                        : "-"
                    }
                  />
                  <SpecCard
                    label="Balance"
                    value={
                      product.spec.balanceMm ? `${product.spec.balanceMm} mm` : "-"
                    }
                  />
                  <SpecCard
                    label="Length"
                    value={product.spec.lengthIn ? `${product.spec.lengthIn} in` : "-"}
                  />
                  <SpecCard
                    label="Pattern Main"
                    value={product.spec.patternMain ?? "-"}
                  />
                  <SpecCard
                    label="Pattern Cross"
                    value={product.spec.patternCross ?? "-"}
                  />
                  <SpecCard
                    label="Stiffness"
                    value={product.spec.stiffnessRa ?? "-"}
                  />
                </div>
              )}
            </section>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}

function SpecCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="product-spec-card">
      <div className="product-spec-card__label">{label}</div>
      <div className="product-spec-card__value">{value}</div>
    </div>
  );
}