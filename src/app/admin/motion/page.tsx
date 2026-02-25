"use client";

import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

import Header from "@/include/Header";
import SideBar from "../include/SideBar";

import {
  PageWrapper,
  MainContentWrapper,
  Content,
  H1,
  H5,
  ContentInner,
  P,
} from "@/styled/Admin.styles";

/**
 * ✅ 메인 비디오 관리 (영상 + 텍스트 + 버튼2 / 항상 1개 유지)
 *
 * API (Spring)
 * - GET  /api/main-video
 * - POST /api/main-video   (multipart/form-data) ✅ 항상 1개 유지(기존 DB/파일 삭제 후 저장) / video 필수
 * - PUT  /api/main-video   (multipart/form-data) ✅ 수정(영상 선택이면 교체, 없으면 텍스트/링크만 변경)
 */

// ✅ 변경: type 교체
type MainVideo = {
  id: number;
  videoUrl: string; // 예: /uploads/main-video/xxx.mp4
  title: string;
  subtitle: string;
  btn1Text?: string | null;
  btn1Link?: string | null;
  btn2Text?: string | null;
  btn2Link?: string | null;
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

// -------------------------
// ✅ API helpers
// -------------------------

// ✅ 변경: GET endpoint
async function apiMainVideoGet(): Promise<MainVideo | null> {
  const res = await fetch(`${API_BASE}/main-video`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  return data;
}

// ✅ 변경: POST (항상 1개 유지, video 필수)
async function apiMainVideoCreateReplace(payload: {
  title: string;
  subtitle: string;
  btn1Text?: string;
  btn1Link?: string;
  btn2Text?: string;
  btn2Link?: string;
  videoFile: File;
}): Promise<MainVideo> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("subtitle", payload.subtitle);
  if (payload.btn1Text) fd.append("btn1Text", payload.btn1Text);
  if (payload.btn1Link) fd.append("btn1Link", payload.btn1Link);
  if (payload.btn2Text) fd.append("btn2Text", payload.btn2Text);
  if (payload.btn2Link) fd.append("btn2Link", payload.btn2Link);
  fd.append("video", payload.videoFile); // ✅ key = video

  const res = await fetch(`${API_BASE}/main-video`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`main-video create failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// ✅ 변경: PUT (영상 선택이면 교체, 없으면 텍스트/링크만 변경)
async function apiMainVideoUpdate(payload: {
  title?: string;
  subtitle?: string;
  btn1Text?: string;
  btn1Link?: string;
  btn2Text?: string;
  btn2Link?: string;
  videoFile?: File | null;
}): Promise<MainVideo> {
  const fd = new FormData();

  // 빈 문자열도 서버에서 null 처리하고 싶으면 trim 후 넣어도 됨
  if (payload.title != null) fd.append("title", payload.title);
  if (payload.subtitle != null) fd.append("subtitle", payload.subtitle);

  if (payload.btn1Text != null) fd.append("btn1Text", payload.btn1Text);
  if (payload.btn1Link != null) fd.append("btn1Link", payload.btn1Link);
  if (payload.btn2Text != null) fd.append("btn2Text", payload.btn2Text);
  if (payload.btn2Link != null) fd.append("btn2Link", payload.btn2Link);

  if (payload.videoFile) fd.append("video", payload.videoFile);

  const res = await fetch(`${API_BASE}/main-video`, {
    method: "PUT",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`main-video update failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// -------------------------
// ✅ Page Component
// -------------------------
export default function MainVideoAdminPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  // ✅ 변경: 현재 비디오(항상 1개)
  const [videoData, setVideoData] = useState<MainVideo | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 변경: 입력값 (영상 + 텍스트 + 버튼2)
  const [title, setTitle] = useState("나이키스킴스 2026");
  const [subtitle, setSubtitle] = useState("출시알림을 설정하고");

  const [btn1Text, setBtn1Text] = useState("알림설정하기");
  const [btn1Link, setBtn1Link] = useState("/notify");

  const [btn2Text, setBtn2Text] = useState("자세히 보기");
  const [btn2Link, setBtn2Link] = useState("/detail");

  const [videoFile, setVideoFile] = useState<File | null>(null);

  // -------------------------
  // ✅ 로그인 체크 (기존 패턴 유지)
  // -------------------------
  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      setIsLogin(res.ok);
    } catch (err) {
      console.error("로그인 체크 실패", err);
      setIsLogin(false);
    }
  };

  // -------------------------
  // ✅ 데이터 로드
  // -------------------------
  const fetchMainVideo = async () => {
    setLoading(true);
    try {
      const data = await apiMainVideoGet();
      setVideoData(data);

      // ✅ 변경: 로드 시 폼 채우기
      if (data) {
        setTitle(data.title ?? "");
        setSubtitle(data.subtitle ?? "");
        setBtn1Text(data.btn1Text ?? "");
        setBtn1Link(data.btn1Link ?? "");
        setBtn2Text(data.btn2Text ?? "");
        setBtn2Link(data.btn2Link ?? "");
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "메인 비디오 조회 실패");
      setVideoData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
    fetchMainVideo();
  }, []);

  // -------------------------
  // ✅ POST 등록(교체): 항상 1개 유지 (video 필수)
  // -------------------------
  const createReplace = async () => {
    const t = title.trim();
    const s = subtitle.trim();

    if (!t) return alert("h1(title)을 입력하세요");
    if (!s) return alert("p(subtitle)을 입력하세요");
    if (!videoFile) return alert("영상을 선택하세요 (POST 등록은 영상 필수)");

    try {
      setLoading(true);

      await apiMainVideoCreateReplace({
        title: t,
        subtitle: s,
        btn1Text: btn1Text.trim() || undefined,
        btn1Link: btn1Link.trim() || undefined,
        btn2Text: btn2Text.trim() || undefined,
        btn2Link: btn2Link.trim() || undefined,
        videoFile,
      });

      setVideoFile(null);
      await fetchMainVideo();
      alert("등록 완료! (기존 비디오/DB는 자동 삭제됨)");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // ✅ PUT 수정: 영상 선택이면 교체, 없으면 텍스트/링크만 수정
  // -------------------------
  const updateMainVideo = async () => {
    const t = title.trim();
    const s = subtitle.trim();

    if (!t) return alert("h1(title)을 입력하세요");
    if (!s) return alert("p(subtitle)을 입력하세요");

    try {
      setLoading(true);

      await apiMainVideoUpdate({
        title: t,
        subtitle: s,
        btn1Text: btn1Text.trim(),
        btn1Link: btn1Link.trim(),
        btn2Text: btn2Text.trim(),
        btn2Link: btn2Link.trim(),
        videoFile, // null이면 교체 안 함
      });

      setVideoFile(null);
      await fetchMainVideo();
      alert("수정 완료!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const videoSrc = videoData?.videoUrl
    ? `${API_ROOT}${videoData.videoUrl}`
    : "/videos/motion.mp4"; // fallback

  // -------------------------
  // ✅ UI
  // -------------------------
  return (
    <PageWrapper>
      <SideBar />

      <MainContentWrapper>
        <Header onOpenModal={() => {}} isLogin={isLogin} setIsLogin={setIsLogin} />

        <Content>
          {/* ✅ 변경: 타이틀 */}
          <H1>메인 비디오 관리 (영상 + 텍스트 + 버튼2 / 항상 1개)</H1>

          <ContentInner style={{ display: "grid", gap: 12 }}>
            {/* ✅ 변경: 등록/수정 폼 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <H5 style={{ margin: 0 }}>메인 비디오 설정</H5>

              <Form.Control
                style={{ maxWidth: 260 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="h1 (title)"
              />

              <Form.Control
                style={{ maxWidth: 320 }}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="p (subtitle)"
              />

              <Form.Control
                style={{ maxWidth: 180 }}
                value={btn1Text}
                onChange={(e) => setBtn1Text(e.target.value)}
                placeholder="버튼1 글씨"
              />
              <Form.Control
                style={{ maxWidth: 260 }}
                value={btn1Link}
                onChange={(e) => setBtn1Link(e.target.value)}
                placeholder="버튼1 링크 (/ 또는 https://)"
              />

              <Form.Control
                style={{ maxWidth: 180 }}
                value={btn2Text}
                onChange={(e) => setBtn2Text(e.target.value)}
                placeholder="버튼2 글씨"
              />
              <Form.Control
                style={{ maxWidth: 260 }}
                value={btn2Link}
                onChange={(e) => setBtn2Link(e.target.value)}
                placeholder="버튼2 링크 (/ 또는 https://)"
              />

              <Form.Control
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                style={{ maxWidth: 280 }}
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setVideoFile(f);
                }}
              />

              <Button variant="primary" onClick={createReplace} disabled={loading}>
                {loading ? "처리중..." : "POST 등록(교체)"}
              </Button>

              <Button variant="warning" onClick={updateMainVideo} disabled={loading}>
                {loading ? "처리중..." : "PUT 수정"}
              </Button>

              <Button variant="outline-secondary" onClick={fetchMainVideo} disabled={loading}>
                {loading ? "로딩..." : "새로고침"}
              </Button>
            </div>

            {videoFile && (
              <P style={{ margin: 0, opacity: 0.75 }}>
                선택됨: <b>{videoFile.name}</b> ({Math.round(videoFile.size / 1024)} KB) —{" "}
                <span style={{ opacity: 0.75 }}>PUT은 영상 선택 안 하면 텍스트/링크만 수정됩니다.</span>
              </P>
            )}

            {/* ✅ 변경: 현재 미리보기 */}
            <div style={{ display: "grid", gap: 10 }}>
              {loading ? (
                <P>불러오는 중...</P>
              ) : (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 10,
                    padding: 12,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>현재 메인 비디오</b>
                    {videoData?.id ? (
                      <span style={{ fontSize: 12, opacity: 0.6 }}>#{videoData.id}</span>
                    ) : (
                      <span style={{ fontSize: 12, opacity: 0.6 }}>(없음 / fallback 재생)</span>
                    )}
                  </div>

                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: "100%", maxWidth: 720, borderRadius: 10, background: "#000" }}
                  >
                    <source src={videoSrc} />
                  </video>

                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    <div>h1: {videoData?.title ?? "-"}</div>
                    <div>p: {videoData?.subtitle ?? "-"}</div>
                    <div>btn1: {videoData?.btn1Text ?? "-"} / {videoData?.btn1Link ?? "-"}</div>
                    <div>btn2: {videoData?.btn2Text ?? "-"} / {videoData?.btn2Link ?? "-"}</div>
                  </div>

                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                    - POST 등록: 기존 비디오 DB/파일 자동 삭제 후 새로 저장<br />
                    - PUT 수정: 영상 선택 시 교체, 미선택 시 텍스트/링크만 변경
                  </div>
                </div>
              )}
            </div>
          </ContentInner>
        </Content>
      </MainContentWrapper>
    </PageWrapper>
  );
}