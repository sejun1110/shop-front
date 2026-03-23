"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/include/Header";
import Footer from "@/include/Footer";
import api from "@/lib/api";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkMe = async () => {
      try {
        await api.get("/auth/me");
        setIsLogin(true);
        router.replace("/");
      } catch {
        setIsLogin(false);
      }
    };

    checkMe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("이메일과 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/login", { email, password });

      setIsLogin(true);
      router.push("/");
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "로그인 실패";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Header isLogin={isLogin} setIsLogin={setIsLogin} />

      <section className="auth-section">
        <div className="auth-card">
          <div className="auth-card__visual" />

          <div className="auth-card__content">
            <div className="auth-card__eyebrow">MEMBER LOGIN</div>
            <h1 className="auth-card__title">Welcome Back</h1>
            <p className="auth-card__desc">
              로그인하고 상품 조회, 장바구니, 주문까지 이어서 진행하세요.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>이메일</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </label>

              <label className="auth-field">
                <span>비밀번호</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                />
              </label>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className="auth-bottom">
              <span>아직 회원이 아니신가요?</span>
              <Link href="/register">회원가입</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}