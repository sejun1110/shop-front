"use client";

import { useEffect, useState } from "react";
import { VideoWrap, TextBanner2 } from "@/styled/Component.styles";
import { BtnWrap, WhiteBtn } from "@/styled/Button.styles";

type MainVideoData = {
  id: number;
  videoUrl: string;      // /uploads/video/xxx.mp4
  title: string;
  subtitle: string;
  btn1Text?: string;
  btn1Link?: string;
  btn2Text?: string;
  btn2Link?: string;
};

const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

export default function  MainVideo (){

const [data, setData] = useState<MainVideoData | null>(null);

useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`${API_BASE}/main-video`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("main video load error", err);
      }
    };

    fetchVideo();
  }, []);

  const videoSrc = data?.videoUrl
    ? `${API_ROOT}${data.videoUrl}`
    : "/videos/motion.mp4"; // fallback

    return(
        <>
<VideoWrap>
    <video
    autoPlay muted loop playsInline
    >
        <source src={videoSrc} type="video/mp4"/>
    </video>
{data &&(
<TextBanner2>
<h1>{data.title}</h1>
<p>{data.subtitle}</p>
<BtnWrap>
            {data.btn1Text && data.btn1Link && (
              <WhiteBtn onClick={() => window.location.href = data.btn1Link!}>
                {data.btn1Text}
              </WhiteBtn>
            )}

            {data.btn2Text && data.btn2Link && (
              <>
                <div className="mx-2"></div>
                <WhiteBtn onClick={() => window.location.href = data.btn2Link!}>
                  {data.btn2Text}
                </WhiteBtn>
              </>
            )}
</BtnWrap>
</TextBanner2>
)}
</VideoWrap>
        </>
    )
}