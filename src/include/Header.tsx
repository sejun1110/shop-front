"use client";

import { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./header.css";

type Props = {
  onOpenModal: () => void;
  isLogin: boolean | null;
  setIsLogin: (v: boolean) => void;
};

type MenuNode = {
  id: number;
  name: string;
  path?: string | null;
  children?: MenuNode[];
};

const API_BASE = "http://localhost:9999/api";

export default function Header({ onOpenModal, isLogin, setIsLogin }: Props) {
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API_BASE}/nav-menus/tree`);
        if (!res.ok) return;
        const data = await res.json();
        setMenus(data);
      } catch (e) {
        console.error("menu load error", e);
      }
    };
    fetchMenus();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setIsLogin(false);
      router.push("/");
    } catch (err) {
      console.error("logout error:", err);
    }
  };

  if (isLogin === null) return null;

  // 🔥 재귀 렌더링 (slug path 그대로 사용)
  const renderTree = (nodes: MenuNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className={`mega-depth-${depth}`}>
        <div className="mega-title">
          {node.path ? (
            <Link href={node.path} className="mega-link">
              {node.name}
            </Link>
          ) : (
            node.name
          )}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="mega-children">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderDropdown = (node: MenuNode) => (
    <NavDropdown
      key={node.id}
      title={node.name}
      id={`nav-${node.id}`}
      className="mega-dropdown"
    >
      <div className="mega-menu">{renderTree(menus)}</div>
    </NavDropdown>
  );

  return (
    <Navbar bg="white" expand="lg" className="border-bottom">
      <Container>
        {/* 브랜드 */}
        <Navbar.Brand as={Link} href="/" style={{ fontWeight: "600" }}>
          My shop
        </Navbar.Brand>

        {/* 가운데 메뉴 */}
        <Nav className="mx-auto">
          {menus.map((m1) =>
            (m1.children ?? []).length > 0 ? (
              renderDropdown(m1)
            ) : (
              <Nav.Link key={m1.id} as={Link} href={m1.path ?? "#"}>
                {m1.name}
              </Nav.Link>
            )
          )}
        </Nav>

        {/* 오른쪽 버튼 */}
        <div className="ms-auto d-flex align-items-center">
          {isLogin ? (
            <>
              <Button
                className="me-2"
                variant="outline-dark"
                onClick={() => router.push("/cart")}
              >
                장바구니
              </Button>

              <Button
                className="me-2"
                variant="outline-dark"
                onClick={() => router.push("/orders")}
              >
                주문
              </Button>

              <Button
                className="me-2"
                variant="outline-dark"
                onClick={() => router.push("/admin")}
              >
                관리자
              </Button>

              <Button variant="outline-dark" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href="/member" className="btn btn-outline-dark me-2">
                회원가입
              </Link>
              <Link href="/login" className="btn btn-outline-dark">
                로그인
              </Link>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}