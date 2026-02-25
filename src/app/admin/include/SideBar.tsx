import { NavItem } from "react-bootstrap";
import {Sidebar, SidebarBrand, SidebarNav} from "@/styled/Admin.styles";
import Link from "next/link";

export default function () {
    return(
<>
    <Sidebar>
        <SidebarBrand href="/">Shop Admin <sup>2</sup></SidebarBrand>
        <SidebarNav>
            <NavItem>
                <Link  href="/admin">Dashboard</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/menu">네비게이션 메뉴 등록</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/cate">카테고리 등록</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin">Products</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/topbanner">상단작은배너등록</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/mainimg">메인이미지 업로드</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/textbanner">텍스트배너 설정</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/motion">메인비디오 업로드</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/scroll">스크롤배너 설정</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/spot">스팟라이트 상품설정</Link>
            </NavItem><br/>

            <NavItem>
                <Link  href="/admin/footer">푸터설정</Link>
            </NavItem><br/>

        </SidebarNav>
    </Sidebar>
</>
    );
}