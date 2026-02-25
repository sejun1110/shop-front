"use client";//👉 Next.js에서 이 파일이 클라이언트 컴포넌트임을 선언
//브라우저에서 실행됨 — useState, useEffect 사용 가능
import {Children, useEffect, useMemo, useState} from "react";
/*
👉 React 훅 가져오기
useState → 상태 관리 useEffect → 마운트 시 실행
useMemo → 계산값 메모이제이션
메모이제이션 : 👉 한 번 계산한 결과를 저장해 두었다가, 
같은 계산을 다시 요청하면 저장된 값을 그대로 사용하는 기법

복잡한 계산을 반복하면 속도가 느려지기 때문
이미 계산한 결과를 저장해 두면 성능이 크게 좋아 진다
📌 예시 (피보나치 수열)
f(n) = f(n-1) + f(n-2)
❌ 메모이제이션 없이
f(5)를 구할 때
f(4), f(3)을 구하고
또 f(3), f(2)를 또 구하고…
→ 같은 계산을 여러 번 함 😭
*/
import {Button, Form} from "react-bootstrap";

import Header from "@/include/Header";
import SideBar from "../include/SideBar";

import { PageWrapper, MainContentWrapper, Content,
H1, H5, ContentInner, P,   
 } from "@/styled/Admin.styles";

 //3️⃣ 상수 & 타입 정의
 const MENU_LS_KEY = "nav_menus"; //👉 localStorage에 저장할 key 이름
 //localStorage 👉 브라우저 안에 데이터를 저장해 두는 공간 브라우저를 꺼도 안 사라지고
 //다시 접속해도 그대로 남아있어요. 

 type MenuNode = {
id:number; //고유값
name:string;  //메뉴 이름
path?:string; //3차 메뉴에서 사용하는 URL
children?:MenuNode[];//하위 메뉴 배열
 };

//4️⃣ localStorage 헬퍼 함수
const loadMenusLS = ():MenuNode[] => {
 if(typeof window === "undefined") return[];
 try{//
 //👉 저장된 JSON 가져오기
 const raw = localStorage.getItem(MENU_LS_KEY);
 if (!raw) return [];//👉 저장된 값이 없다면 (null 이거나 빈 값이면) 빈 배열 반환
 //👉 문자열 → 객체 변환
 const parsed = JSON.parse(raw);
 //👉 혹시 파싱은 됐는데 배열이 아닐 경우 방어 코드 배열이 아니면 잘못된 데이터 그래서 빈 배열 반환
 if(!Array.isArray(parsed)) return[];
 return parsed; //👉 정상적인 배열이면 그 데이터를 그대로 반환
 } catch {
    return []; //👉 JSON.parse 중 에러가 나면 👉 그냥 빈 배열 반환
 }
}
//👉 SSR 환경 보호 (브라우저 아닐 경우 실행 방지)
//server-Side Rendering(서버 사이드 렌더링)의 약자로, 
// 웹 페이지를 브라우저가 아닌 서버에서 미리 렌더링하여 
// 완전한 HTML 형태로 클라이언트에 전달하는 방식입니다

const saveMenusLS = (menus: MenuNode[]) => {
//(menus: MenuNode[]) → MenuNode 타입 배열을 매개변수로 받는다
//즉, 저장할 메뉴 목록을 전달받는 함수 
 if(typeof window === "undefined") return;
 /*
 window가 없으면 (SSR / 서버 환경) localStorage를 사용할 수 없음 
 그래서 그냥 함수 종료 (return)
 */
localStorage.setItem(MENU_LS_KEY, JSON.stringify(menus));
//자바스크립트 객체(배열)를 문자열(JSON 형태)로 변환
}

const nextMenuIdFrom = (menus: MenuNode[]) => {
    let max = 0; //처음엔 0부터 시작
//재귀함수 nodes 배열(현재 단계의 노드들)을 돌면서 
// max를 갱신하고, 자식도 계속 탐색
const walk = (nodes:MenuNode[]) => {
    for(const n of nodes) {
        //nodes 배열의 각 요소를 하나씩 n에 담아 반복
        max = Math.max(max, n.id);
        //현재 max 값과 n.id 중 더 큰 값을 max에 저장
if(n.children?.length) walk(n.children);//자식 배열이 존재하고 비어있지 않으면 walk(n.children) 실행
//n.children가 있으면(=자식 메뉴가 있으면) 그 자식들도 탐색해야 하니까 재귀 호출
//?.는 옵셔널 체이닝:
//n.children가 undefined/null이면 에러 안 나고 그냥 넘어감
    }
};
walk(menus); //실제로 실행 탐색을 시작하는 실행코드
return max + 1;//탐색이 끝나면, 가장 큰 id 값이 max에 들어있음
//그 다음 번호를 새로 발급하려고 max + 1 반환
}

export default function NavMenuPage() {
const [isLogin, setIsLogin] = useState<boolean>(false);

//
const [menuList, setMenuList] = useState<MenuNode[]>([]);

// ✅ 입력값 (1/2/3차)
const [menu1Name, setMenu1Name] =useState("")
const [menu2Name, setMenu2Name] =useState("")
const [menu3Name, setMenu3Name] =useState("")
const [menu3Path, setMenu3Path] =useState("")
/*
✅ 1차 → 그룹(폴더 개념)
✅ 2차 → 중간 분류
✅ 3차 → 실제 페이지 (라우팅 대상)
*/

// ✅ 선택값
const [selectedMenu1Id, setSelectedMenu1Id] = useState<number | "">("")
const [selectedMenu2Id, setSelectedMenu2Id] = useState<number | "">("")

//로그인 상태 체크 (기존 패턴 유지)
const API_ROOT = "http://localhost:9999";
const API_BASE = `${API_ROOT}/api`;

const checkLogin = async () => {
    try{
const res = await fetch(`${API_BASE}/auth/me`, {credentials:"include"});
/*
fetch() → 서버에 HTTP 요청 보내는 함수
${API_BASE}/auth/me → 로그인한 사용자 정보를 확인하는 API
*/
setIsLogin(res.ok);
//
    }catch(err){
console.error("로그인 체크 실패", err);
setIsLogin(false);      
    }
}


//메뉴로드 리프레시
const fetchMenus = () => {
    const ls = loadMenusLS();
    setMenuList(ls);
};

useEffect(() => {
    checkLogin(); fetchMenus();
},[]);

//1차 생성
const createMenu1 = () => {

    const name = menu1Name.trim();//앞뒤 공백 제거
    
    if(!name) return alert("1차 메뉴명을 입력하세요");
    //빈 값이면 추가하지 않음

    setMenuList((prev) => {//menuList 상태를 업데이트하는 코드
        //기존 메뉴들 중 가장 큰 id 찾고 
        const id = nextMenuIdFrom(prev);
        const next = [...prev, {id, name, Children:[]}];
        //...prev → 기존 메뉴 전부 복사 에 새 객체 추가
        saveMenusLS(next);//업데이트된 메뉴 배열을 localStorage에 저장
        return next;//상태를 새 배열로 업데이트
    });
    setMenu1Name("");//입력창 초기화
};

//2차 생성
const createMenu2 = () => {
    const name = menu2Name.trim();
    //name이 비어있으면 경고창 띄우고 함수 종료
    if(!name) return alert("2차 메뉴명을 입력하세요");
    //2차 메뉴는 반드시 1차 메뉴 아래에 들어가야 하니까
    if(selectedMenu1Id === "") return alert("부모(1차) 메뉴를 선택하세요.")
    const parentId = Number(selectedMenu1Id);
    setMenuList((prev) => {//메뉴 리스트 상태 업데이트 시작
        const id=nextMenuIdFrom(prev);
        //전체 메뉴 트리를 훑어서 가장 큰 id를 찾고 새로 추가할 2차 메뉴의 id를 생성
        const next = prev.map((m1) => {//기존 1차 메뉴 배열을 map으로 순회하면서
            //부모가 되는 1차 메뉴만 찾아서 children에 추가하려는 로직 m1은 각1차 메뉴 노드
            if(m1.id !== parentId) return m1;
            //지금 보고 있는 1차 메뉴가 내가 선택한 부모가 아니면 그대로 반환(변경 없음)
            const children = m1.children ?? []; 
            //부모 1차 메뉴의 자식(2차 메뉴 배열)을 가져옴
            return {...m1, children:[...children,{id, name, children:[]}]};
        });
        saveMenusLS(next);//변경된 메뉴 트리를 localStorage에 저장
        return next;//React state(menuList)를 next로 업데이트
    });
    setMenu2Name("");//2차 메뉴 입력창 초기화(비우기)
};

//3차 생성
const createMenu3 = () => { //3차 메뉴 생성
    
    const name = menu3Name.trim();//3차 메뉴명
    const path = menu3Path.trim();//3차 메뉴 이동 경로(URL)

    if(!name) return alert("3차 메뉴명을 입력하세요.");

    if(!path) return alert("3차 메뉴 경로(path)를 입력하세요. 예: /men/tshirt");

    if(selectedMenu1Id === "") return alert("부모(1차) 메뉴를 먼저 선택하세요");
    if(selectedMenu2Id === "") return alert("부모(2차) 메뉴를 먼저 선택하세요");

    const p1 = Number(selectedMenu1Id);
    const p2 = Number(selectedMenu2Id);
//선택된 id는 number | "" 타입이라 숫자로 변환

const normalizedPath = path.startsWith("/") ? path: `/${path}`;
/*
path를 “항상 / 로 시작하게” 정리(정규화) 
만약 사용자가 men/tshirt처럼 입력하면 → /men/tshirt로 바꿈
이미 /men/tshirt면 그대로 사용
*/
setMenuList((prev) => {//메뉴 트리 상태 업데이트 시작
    const id = nextMenuIdFrom(prev); //전체 트리에서 가장 큰 id 찾고 +1 해서
    //새 3차 메뉴의 id 생성
    const next = prev.map((m1) => {//1차 메뉴들을 순회하면서 (트리 1단계)
//현재 1차 메뉴가 선택한 부모(1차)가 아니면 변경 없이 그대로 반환
if(m1.id !== p1) return m1;

return{
...m1,//선택한 1차 메뉴를 “복사”해서 수정본을 만들기 시작 
children:(m1.children ?? []).map((m2) => {
//그 1차 메뉴의 자식(2차 배열)을 가져옴  m1.children이 없으면 빈 배열로 처리
//그리고 2차들을 map으로 순회 (트리 2단계)
if(m2.id !== p2) return m2;
//현재 2차 메뉴가 선택한 부모(2차)가 아니면 그대로 반환  
    return{
        ...m2,//선택된 2차 메뉴를 복사해서 수정본 만들기 시작
        
        children:[//2차 메뉴의 children(=3차 메뉴 목록에)새 3차를 추가
        ...(m2.children ?? []),
        {id, name, path:normalizedPath},
        ],
    };
}),
};
});

saveMenusLS(next);//변경된 트리를 localStorage에 저장
return next;//React 상태(menuList)를 next로 업데이트
});
};

//선택된 메뉴 객체를 가져오는 로직
//선택된 1차 메뉴 객체를 계산해서 메모이제이션 
const selectedMenu1 = useMemo( 
    () => menuList.find((m1) => m1.id === Number(selectedMenu1Id)), 
[menuList, selectedMenu1Id]
);
//2차
const selectedMenu2 = useMemo(
    () => (selectedMenu1?.children ??[]).find(
       (m2) => m2.id === Number(selectedMenu2Id) 
    ),
    [selectedMenu1, selectedMenu2Id]
);


// -------------------------
  // ✅ 삭제
  // -------------------------
  const deleteMenu1 = (menu1Id: number) => {
    if (!confirm("1차 메뉴를 삭제할까요? (하위 2/3차도 같이 삭제됩니다)")) return;

    setMenuList((prev) => {
      const next = prev.filter((m1) => m1.id !== menu1Id);
      saveMenusLS(next);
      return next;
    });

    // 선택 해제
    setSelectedMenu1Id((prev) => (prev === menu1Id ? "" : prev));
    setSelectedMenu2Id("");
  };

  const deleteMenu2 = (menu1Id: number, menu2Id: number) => {
    if (!confirm("2차 메뉴를 삭제할까요? (하위 3차도 같이 삭제됩니다)")) return;

    setMenuList((prev) => {
      const next = prev.map((m1) => {
        if (m1.id !== menu1Id) return m1;
        return {
          ...m1,
          children: (m1.children ?? []).filter((m2) => m2.id !== menu2Id),
        };
      });
      saveMenusLS(next);
      return next;
    });

    setSelectedMenu2Id((prev) => (prev === menu2Id ? "" : prev));
  };

  const deleteMenu3 = (menu1Id: number, menu2Id: number, menu3Id: number) => {
    if (!confirm("3차 메뉴를 삭제할까요?")) return;

    setMenuList((prev) => {
      const next = prev.map((m1) => {
        if (m1.id !== menu1Id) return m1;

        return {
          ...m1,
          children: (m1.children ?? []).map((m2) => {
            if (m2.id !== menu2Id) return m2;

            return {
              ...m2,
              children: (m2.children ?? []).filter((m3) => m3.id !== menu3Id),
            };
          }),
        };
      });

      saveMenusLS(next);
      return next;
    });
  };


return(
    <>
 <PageWrapper>
        <SideBar />

        <MainContentWrapper>
          {/* Header 재사용 (onOpenModal은 필요 없지만, 기존 props 맞추기 위해 noop 처리) */}
          <Header onOpenModal={() => {}} isLogin={isLogin} setIsLogin={setIsLogin} />

          <Content>
            <H1>네비게이션 메뉴 관리</H1>

            <ContentInner style={{ display: "grid", gap: 12 }}>
              {/* 1차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>1차 메뉴 등록</H5>
                <Form.Control
                  style={{ maxWidth: 320 }}
                  value={menu1Name}
                  onChange={(e) => setMenu1Name(e.target.value)}
                  placeholder="예: 쇼핑몰, 고객센터..."
                />
                <Button variant="primary" onClick={createMenu1}>
                  1차 추가
                </Button>
                <Button variant="outline-secondary" onClick={fetchMenus}>
                  새로고침
                </Button>
              </div>

              {/* 2차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>2차 메뉴 등록</H5>

                <Form.Select
                  style={{ maxWidth: 260 }}
                  value={selectedMenu1Id}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedMenu1Id(v === "" ? "" : Number(v));
                    setSelectedMenu2Id(""); // ✅ 1차 바뀌면 2차 선택 초기화
                  }}
                >
                  <option value="">부모(1차) 선택</option>
                  {menuList.map((m1) => (
                    <option key={m1.id} value={m1.id}>
                      {m1.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  style={{ maxWidth: 320 }}
                  value={menu2Name}
                  onChange={(e) => setMenu2Name(e.target.value)}
                  placeholder="예: 남성, 여성, 공지사항..."
                />

                <Button variant="success" onClick={createMenu2}>
                  2차 추가
                </Button>
              </div>

              {/* 3차 등록 */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <H5 style={{ margin: 0 }}>3차 메뉴 등록</H5>

                <Form.Select
                  style={{ maxWidth: 260 }}
                  value={selectedMenu2Id}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedMenu2Id(v === "" ? "" : Number(v));
                  }}
                  disabled={selectedMenu1Id === ""}
                >
                  <option value="">
                    {selectedMenu1Id === "" ? "먼저 1차 선택" : "부모(2차) 선택"}
                  </option>
                  {(selectedMenu1?.children ?? []).map((m2) => (
                    <option key={m2.id} value={m2.id}>
                      {m2.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  style={{ maxWidth: 220 }}
                  value={menu3Name}
                  onChange={(e) => setMenu3Name(e.target.value)}
                  placeholder="예: 티셔츠, 바지..."
                />
                <Form.Control
                  style={{ maxWidth: 260 }}
                  value={menu3Path}
                  onChange={(e) => setMenu3Path(e.target.value)}
                  placeholder="예: /men/tshirt"
                />

                <Button variant="warning" onClick={createMenu3}>
                  3차 추가
                </Button>
              </div>

              {/* 목록 */}
              <div style={{ display: "grid", gap: 10 }}>
                {menuList.length === 0 ? (
                  <P>등록된 메뉴가 없습니다. 위에서 1차/2차/3차를 추가하세요.</P>
                ) : (
                  menuList.map((m1) => (
                    <div
                      key={m1.id}
                      style={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      {/* 1차 헤더 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <H5 style={{ margin: 0 }}>{m1.name}</H5>
                        <P style={{ margin: 0, opacity: 0.7 }}>({m1.id})</P>

                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              setSelectedMenu1Id(m1.id);
                              setSelectedMenu2Id("");
                            }}
                          >
                            2/3차 추가 대상 선택
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteMenu1(m1.id)}>
                            1차 삭제
                          </Button>
                        </div>
                      </div>

                      {/* 2차 목록 */}
                      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {(m1.children ?? []).length === 0 ? (
                          <P style={{ margin: 0 }}>2차 메뉴가 없습니다.</P>
                        ) : (
                          (m1.children ?? []).map((m2) => (
                            <div
                              key={m2.id}
                              style={{
                                border: "1px solid rgba(0,0,0,0.06)",
                                borderRadius: 10,
                                padding: 10,
                              }}
                            >
                              {/* 2차 헤더 */}
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{m2.name}</span>
                                <span style={{ fontSize: 12, opacity: 0.6 }}>({m2.id})</span>

                                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => {
                                      setSelectedMenu1Id(m1.id);
                                      setSelectedMenu2Id(m2.id);
                                    }}
                                  >
                                    3차 추가 대상 선택
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => deleteMenu2(m1.id, m2.id)}
                                  >
                                    2차 삭제
                                  </Button>
                                </div>
                              </div>

                              {/* 3차 목록 */}
                              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {(m2.children ?? []).length === 0 ? (
                                  <P style={{ margin: 0 }}>3차 메뉴가 없습니다.</P>
                                ) : (
                                  (m2.children ?? []).map((m3) => (
                                    <div
                                      key={m3.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "6px 10px",
                                        border: "1px solid rgba(0,0,0,0.08)",
                                        borderRadius: 999,
                                      }}
                                    >
                                      <span style={{ fontSize: 14 }}>{m3.name}</span>
                                      <span style={{ fontSize: 12, opacity: 0.6 }}>({m3.id})</span>
                                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                                        {m3.path ?? "-"}
                                      </span>

                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => deleteMenu3(m1.id, m2.id, m3.id)}
                                        style={{ padding: "2px 8px" }}
                                      >
                                        삭제
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 선택 상태 표시 (디버그/편의) */}
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                <P style={{ margin: 0 }}>
                  선택된 1차:{" "}
                  <b>{selectedMenu1Id === "" ? "-" : selectedMenu1?.name ?? "-"}</b>
                  {"  "} / 선택된 2차:{" "}
                  <b>{selectedMenu2Id === "" ? "-" : selectedMenu2?.name ?? "-"}</b>
                </P>
              </div>
            </ContentInner>
          </Content>
        </MainContentWrapper>
      </PageWrapper>    
    </>
)


}
