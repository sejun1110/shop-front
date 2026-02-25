import styled from "styled-components";
import {Container, Card, Button} from "react-bootstrap";

/*전체 컨테이너 */
export const PageContainer = styled(Container)`
margin-top:5rem;
`;

/*카드 */
export const LeftImage = styled.div`
width:100%; height:100%;
background:url("/img/login.jpg") center / cover no-repeat;
`;

/*폼영역 */
export const FormWrapper = styled.div`padding:3rem`;

/*성별 라벨 */
export const GenderLabel = styled.label`
margin-right:1rem; font-weight:500;
`;

/*주소검색 영역 */
export const AddressGroup = styled.div`
display:flex; gap:0.5rem;
`;

/*주소 검색 버튼 */
export const AddressButton = styled.button`
width:25%; background-color:#6c757d;
border:none; color:#fff; border-radius:0.35rem;
&:hover{
background-color:#5a6268;
}
`;

/*회원가입 버튼 */
export const SubmitButton = styled(Button)`
width:100%; margin-bottom:0.5rem;
`;

export const SocialButton = styled.a<{bg:string}>`
display:flex; align-items:center; justify-content:center;
gap:0.75rem; width:100%; padding:0.75rem; margin-bottom:0.5rem;
font-size:0.9rem; font-weight:600; color:#fff; 
background-color:${({bg}) => bg};
border-radius:0.35rem; text-decoration:none;
transition:all 0.2s ease-in-out;
&:hover{
opacity:0.9; color:#fff; text-decoration:none;
}
`;
export const StyledCard = styled(Card)`
border:none;
box-shadow:0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%);
border-radius:0.5rem;
`;

export const FooterLinks = styled.div`
margin-top:1rem; text-align:center;
`;
export const FooterLink = styled.a`
display:inline-block; margin-bottom:0.5rem; font-size:0.85rem;
color:#6c757d; text-decoration:none; 
&:hover{
text-decoration:underline; color:#495057;
}
`;
