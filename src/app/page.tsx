"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api, { API_ROOT } from "@/lib/api";
import type { PageResponse } from "@/types/common";
import type { ProductListItem } from "@/types/product";
import type { MenuNode } from "@/types/menu";
import "./page.css";

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "NEW SEASON",
    title: "경쾌하게, 더 빠르게.\n테니스 라켓의 기준을 다시 고르다.",
    desc: "경기력과 스타일을 모두 잡는 라켓, 스트링, 액세서리를 한눈에 만나보세요.",
    ctaHref: "/products",
    ctaText: "상품 보러가기",
    subHref: "/cart",
    subText: "장바구니 보기",
  },
  {
    id: 2,
    eyebrow: "BEST PICK",
    title: "실전감 좋은 인기 라켓을\n추천 구성으로 제안합니다.",
    desc: "입문자부터 중상급자까지, 플레이 성향에 맞는 추천 라인업을 확인하세요.",
    ctaHref: "/products",
    ctaText: "추천 상품 보기",
    subHref: "/orders",
    subText: "주문 내역 보기",
  },
  {
    id: 3,
    eyebrow: "SHOP BENEFIT",
    title: "브랜드별 최신 상품과\n카테고리를 더 빠르게 탐색하세요.",
    desc: "카테고리, 추천 상품, 최신 등록 상품까지 쇼핑 흐름을 홈에서 바로 이어갈 수 있습니다.",
    ctaHref: "/products",
    ctaText: "전체 상품 보기",
    subHref: "/register",
    subText: "회원가입",
  },
];

type HomeProduct = ProductListItem & {
  resolvedId: number | string | null;
};

function getImageSrc(imageUrl?: string | null) {
  if (!imageUrl) return "/no-image.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_ROOT}${imageUrl}`;
}

function resolveProductId(product: ProductListItem): number | string | null {
  const maybeProductId = (product as ProductListItem & { productId?: number | string }).productId;
  const maybeId = (product as ProductListItem & { id?: number | string }).id;

  return maybeProductId ?? maybeId ?? null;
}

export default function HomePage() {
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const latestProducts = useMemo(() => products.slice(0, 8), [products]);
  const quickMenus = useMemo(() => menus.slice(0, 6), [menus]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productRes, menuRes] = await Promise.all([
          api.get<PageResponse<ProductListItem>>("/products", {
            params: { page: 0, size: 12, sort: "latest" },
          }),
          api.get<MenuNode[]>("/nav-menus/tree"),
        ]);

        const rawProducts = Array.isArray(productRes.data.items)
          ? productRes.data.items
          : [];

        const normalizedProducts: HomeProduct[] = rawProducts.map((product) => ({
          ...product,
          resolvedId: resolveProductId(product),
        }));

        setProducts(normalizedProducts);
        setMenus(Array.isArray(menuRes.data) ? menuRes.data : []);

        try {
          await api.get("/auth/me");
          setIsLogin(true);
        } catch {
          setIsLogin(false);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "홈 데이터 로딩 실패";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <main className="home-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="hero-section">
        <div className="hero-section__inner">
          <div className="hero-copy">
            <div className="hero-copy__eyebrow">{currentSlide.eyebrow}</div>
            <h1 className="hero-copy__title">
              {currentSlide.title.split("\n").map((line, index) => (
                <span key={`${currentSlide.id}-${index}`}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="hero-copy__desc">{currentSlide.desc}</p>

            <div className="hero-copy__actions">
              <Link href={currentSlide.ctaHref} className="hero-btn hero-btn--primary">
                {currentSlide.ctaText}
              </Link>
              <Link href={currentSlide.subHref} className="hero-btn hero-btn--ghost">
                {currentSlide.subText}
              </Link>
            </div>

            <div className="hero-indicators">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`hero-indicator ${index === activeSlide ? "is-active" : ""}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`슬라이드 ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card--main">
              <div className="hero-card__label">CURATED PICK</div>
              <div className="hero-card__headline">테니스 쇼핑을 더 직관적으로</div>
              <div className="hero-card__text">
                추천 상품, 최신 상품, 카테고리 탐색을 한 화면에서 이어가도록 재구성했습니다.
              </div>
            </div>

            <div className="hero-card hero-card--sub">
              <div className="hero-card__label">READY TO PLAY</div>
              <div className="hero-card__headline">입문 · 실전 · 스타일</div>
              <div className="hero-card__text">
                플레이 성향에 맞는 상품 탐색 흐름을 빠르게 시작하세요.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div>
            <div className="section-head__eyebrow">QUICK CATEGORY</div>
            <h2 className="section-head__title">카테고리 바로가기</h2>
          </div>
          <Link href="/products" className="section-head__link">
            전체 상품 보기
          </Link>
        </div>

        {quickMenus.length === 0 ? (
          <div className="empty-box">카테고리가 없습니다.</div>
        ) : (
          <div className="category-grid">
            {quickMenus.map((menu) => (
              <Link
                key={menu.id}
                href={menu.path || "/products"}
                className="category-card"
              >
                <div className="category-card__name">{menu.name}</div>
                <div className="category-card__sub">
                  {(menu.children ?? [])
                    .slice(0, 3)
                    .map((child) => child.name)
                    .join(" · ") || "상품 둘러보기"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="section-head">
          <div>
            <div className="section-head__eyebrow">FEATURED</div>
            <h2 className="section-head__title">추천 상품</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-box">상품 불러오는 중...</div>
        ) : error ? (
          <div className="empty-box empty-box--error">{error}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="empty-box">추천 상품이 없습니다.</div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product, index) => {
              const detailId = product.resolvedId;
              const itemKey = `featured-${detailId ?? "unknown"}-${index}`;

              return (
                <Link
                  key={itemKey}
                  href={detailId ? `/products/${detailId}` : "#"}
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
                    <div className="product-card__title">{product.title}</div>
                    <div className="product-card__meta">
                      {product.brandName || "브랜드"}
                    </div>
                    <div className="product-card__price">
                      {Number(product.price ?? 0).toLocaleString()}원
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="home-section home-section--soft">
        <div className="section-head">
          <div>
            <div className="section-head__eyebrow">LATEST</div>
            <h2 className="section-head__title">최신 등록 상품</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-box">상품 불러오는 중...</div>
        ) : error ? (
          <div className="empty-box empty-box--error">{error}</div>
        ) : latestProducts.length === 0 ? (
          <div className="empty-box">최신 등록 상품이 없습니다.</div>
        ) : (
          <div className="product-grid product-grid--wide">
            {latestProducts.map((product, index) => {
              const detailId = product.resolvedId;
              const itemKey = `latest-${detailId ?? "unknown"}-${index}`;

              return (
                <Link
                  key={itemKey}
                  href={detailId ? `/products/${detailId}` : "#"}
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
                    <div className="product-card__title">{product.title}</div>
                    <div className="product-card__meta">
                      {product.brandName || "브랜드"}
                    </div>
                    <div className="product-card__price">
                      {Number(product.price ?? 0).toLocaleString()}원
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="promo-banner">
          <div>
            <div className="promo-banner__eyebrow">BRAND & EVENT</div>
            <h2 className="promo-banner__title">브랜드와 이벤트 영역도 홈에서 확장 가능</h2>
            <p className="promo-banner__desc">
              현재 구조에서는 추천/최신/카테고리를 먼저 안정화하고, 이후 브랜드 전용 섹션이나 이벤트 배너를 이어서 붙이면 된다.
            </p>
          </div>

          <div className="promo-banner__actions">
            <Link href="/products" className="hero-btn hero-btn--primary">
              쇼핑 시작하기
            </Link>
            <Link href="/cart" className="hero-btn hero-btn--ghost">
              장바구니 보기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}