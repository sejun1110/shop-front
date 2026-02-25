"use client";

import { useState } from "react";
import * as S from "@/styled/Login.styles";
import api from "@/lib/axios"; // 공통 axios

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요!");
      return;
    }

    try {
      // ✅ 세션 로그인 (🔥 이 옵션이 핵심)
      await api.post(
        "/api/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true, // ✅ 추가
        }
      );

      alert("로그인 성공 🎉");

      // ✅ Header 다시 마운트
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("로그인 실패! 이메일 또는 비밀번호를 확인해 주세요");
    }
  };

  return (
    <S.Wrapper>
      <S.Card>
        <S.LeftImage />
        <S.Right>
          <S.Title>Welcome Back!</S.Title>

          <S.Form onSubmit={handleSubmit}>
            <S.Input
              type="email"
              placeholder="Enter Email Address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <S.Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <S.CheckboxWrapper>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember Me</label>
            </S.CheckboxWrapper>

            <S.Button type="submit">Login</S.Button>
          </S.Form>

          <S.Divider />

          <S.LinkText href="/forgot">Forgot Password?</S.LinkText>
          <S.LinkText href="/member">Create an Account!</S.LinkText>
        </S.Right>
      </S.Card>
    </S.Wrapper>
  );
}
