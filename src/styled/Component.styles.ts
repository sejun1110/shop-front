import styled from "styled-components";

export const Group = styled.div``;
export const Left = styled.div``;
export const Right = styled.div``;
export const Text1 = styled.h1``;
export const Text2 = styled.h2``;
export const Text3 = styled.h3``;
export const Text4 = styled.h4``;
export const Text5 = styled.h5``;
export const Text6 = styled.h6`
font-size:12px; font-weight:400;
letter-spacing:-3%;
`;

export const Span = styled.span`
display:flex;
justify-content:flex-start;
align-items:center;
flex-direction:column;
`;

export const Dflex = styled.div`
display:flex;
justify-content:flex-start;
align-items:center;
`;

export const DflexEnd = styled.div`
display:flex;
justify-content:flex-end;
align-items:center;
`;

export const Center = styled.div`
display:flex;
justify-content:center;
align-items:center;
flex-direction:column;
`;

export const PageTotal = styled.div`
font-size:12px; font-weight:400; color:gray;
`;

export const SpaceBetween = styled.div`
display:flex; justify-content:space-between;
align-items:center;
`;

export const Sidebar = styled.ul`
  /* bootstrap sb-admin 스타일을 쓰고 있으면 대부분 필요 없음 */
  /* 그래도 레이아웃 깨질 때를 대비한 최소 보정만 */
  min-height: 100vh;
`;

export const Brand = styled.a`
  /* 기존 bootstrap 클래스가 대부분 처리하지만, 라인 깨짐 방지 */
  text-decoration: none;
`;

export const BrandText = styled.div`
  /* “MES sea2” 텍스트 영역 정렬 보정 */
  line-height: 1.2;
  white-space: nowrap;
`;

export const Divider = styled.hr``;

export const SidebarCard = styled.div`
  /* 카드 영역이 레이아웃 밀면 여기를 조절 */
`;

export const Img = styled.image`
width:100%; max-width:100%;
overflow-x:hidden;
`;

export const TextBanner = styled.div`
width:100%;
padding:20px;
display:flex; justify-content:center;
align-items:center;
flex-direction:column;
  h1{
  font-size:5rem;
  font-weight:800;
  letter-spacing:-3%;
  }
  p{
  font-size:1rem;
  font-weight:400;
  letter-spacing:-3%;
  }
`;

export const TextBanner2 = styled.div`
position:absolute;
top:83%; left:50%;
transform : translate(-50%, -50%);
z-index:2;
width:100%;
padding:20px;
display:flex; justify-content:center;
align-items:center;
flex-direction:column;
  h1{
  font-size:5rem;
  font-weight:800;
  letter-spacing:-3%;
  color:white;
  }
  p{
  font-size:1rem;
  font-weight:400;
  letter-spacing:-3%;
  color:white;
  }
`;

export const VideoWrap = styled.div`
width:100%; 
position:relative;
overflow:hidden;
`;

export const BackgroundVideo = styled.video`
position:absolute; top:0; left:0;
width:100%; height:100%; object-fit:cover; 
z-index:0;
`;

export const ScrollWrap = styled.div`
padding:0px 40px;
display:flex;
gap:20px;

overflow-x : auto; 
overflow-y: hidden;
scroll-behavior:smooth;

&::-webkit-scrollbar{height:6px;}
&::-webkit-scrollbar-thumb{background:#ccc; border-radius:10px;}

`;

export const ImgWrap = styled.div`
position:relative;
flex: 0 0 clac((100% - 40px) / 3)
height:auto;
object-fit:cover;
z-index:0;
`;

export const ImgTextWrap = styled.div`
position:absolute;
top:80%; left:5%;
z-index:2;
h2{
font-weight:600;
color:white;
margin-bottom:20px;
}
`;

export const SpotLight = styled.div`
display:flex;
justify-content:center;
flex-direction:column;
align-items:center;
h1{
margin-top:140px;
font-size:5rem;
font-weight:800;
}
p{
font-size:1rem;
font-weight:400;
}
`;

export const SpotLightIconWrap = styled.div`
display:flex; flex-wrap:wrap; 
width:80%; justify-content:space-between; 
align-items:center;
`;
export const SpotLightIcon = styled.div`
margin-right:30px;
h6{
font-weight:800;
text-align:center;
font-size:.8rem;
}
`;

export const FooterWrap = styled.footer`
width:100%;
border-top:1px solid #ccc;
padding:0px 40px;
display:flex; 
justify-content:space-between;

p{
padding:30px 0px;
font-size:12px;
width:48%;
line-height:24px;
}

`;

export const FooterMenu = styled.div`
padding:40px 0px;
h6{
margin-bottom:30px;
font-weight:800;
}
a{
color:inherit;
text-decoration:none;
line-height:40px;
font-weight:500;
}

`;