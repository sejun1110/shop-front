"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api, { API_ROOT } from "@/lib/api";
import "./page.css";

type ProductItem = {
  productId: number;
  title: string;
  brandName?: string | null;
  price: number;
  imageUrl?: string | null;
  status?: string;
};

type ProductPageResponse = {
  items?: ProductItem[];
  content?: ProductItem[];
};

function getImageSrc(imageUrl?: string | null) {
  if (!imageUrl) return "/no-image.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_ROOT}${imageUrl}`;
}

export default function ProductsPage() {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<ProductItem[] | ProductPageResponse>("/products", {
          params: {
            page: 0,
            size: 24,
            sort: "latest",
          },
        });

        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.content)
              ? data.content
              : [];

        setProducts(list);

        try {
          await api.get("/members/me");
          setIsLogin(true);
        } catch {
          setIsLogin(false);
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "상품 목록을 불러오지 못했습니다.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => product.status !== "DELETED");
  }, [products]);

  return (
    <main className="products-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="products-hero">
        <div className="products-hero__inner">
          <div className="products-hero__eyebrow">PRODUCTS</div>
          <h1 className="products-hero__title">테니스 라켓 상품 목록</h1>
          <p className="products-hero__desc">
            홈에서 본 추천 상품과 최신 상품을 전체 목록에서 이어서 탐색할 수 있도록
            구성했습니다.
          </p>
        </div>
      </section>

      <section className="products-section">
        <div className="products-section__head">
          <div>
            <div className="products-section__label">ALL ITEMS</div>
            <h2 className="products-section__title">전체 상품</h2>
          </div>
          <div className="products-section__count">
            총 {visibleProducts.length}개
          </div>
        </div>

        {loading ? (
          <div className="products-empty">상품을 불러오는 중...</div>
        ) : error ? (
          <div className="products-empty products-empty--error">{error}</div>
        ) : visibleProducts.length === 0 ? (
          <div className="products-empty">등록된 상품이 없습니다.</div>
        ) : (
          <div className="products-grid">
            {visibleProducts.map((product) => (
              <Link
                 key={product.productId || `product-${index}`}
                 href={`/products/${product.productId}`}
                className="product-card"
              >
                <div className="product-card__image-wrap">
                  <img
                    src={getImageSrc(product.imageUrl)}
                    alt={product.title}
                    className="product-card__image"
                  />
                </div>

                <div className="product-card__body">
                  <div className="product-card__brand">
                    {product.brandName || "브랜드"}
                  </div>
                  <div className="product-card__title">{product.title}</div>
                  <div className="product-card__price">
                    {Number(product.price ?? 0).toLocaleString()}원
                  </div>
                  <div className="product-card__cta">상세 보기</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}