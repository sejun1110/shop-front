import styled from "styled-components";
import { Container, Card } from "react-bootstrap";

/* 전체 컨테이너 */
export const PageContainer = styled(Container)`
  margin-top: 5rem;
`;

/* 카드 */
export const StyledCard = styled(Card)`
  border: none;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  overflow: hidden;
`;

/* 왼쪽 이미지 */
export const LeftImage = styled.div`
  width: 100%;
  height: 100%;
  min-height: 640px;
  background: url("/img/login.jpg") center / cover no-repeat;
`;

/* 폼 영역 */
export const FormWrapper = styled.div`
  padding: 3rem;
`;

/* 성별 라벨 */
export const GenderLabel = styled.label`
  margin-right: 1rem;
  font-weight: 500;
  color: #334155;
`;

/* 주소검색 영역 */
export const AddressGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

/* 우편번호 input */
export const ZipCodeInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0.375rem 0.9rem;
  border: 1px solid #d8dee8;
  border-radius: 0.75rem;
  background-color: #ffffff;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #7c8aa5;
    box-shadow: 0 0 0 3px rgba(125, 138, 165, 0.14);
  }
`;

/* 공통 버튼 베이스 */
const buttonShadow = `
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.10);
`;

const buttonHoverShadow = `
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
`;

/* 주소 검색 버튼 */
export const AddressButton = styled.button`
  width: 120px;
  flex-shrink: 0;
  height: 44px;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #8ec5ff 0%, #5aa9ff 100%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  box-shadow: 0 8px 18px rgba(90, 169, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
    box-shadow: 0 12px 24px rgba(90, 169, 255, 0.28);
  }
`;

/* 회원가입 버튼 */
export const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 0.9rem;
  margin-bottom: 0.75rem;
  border: none;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, #5aa9ff 0%, #3b82f6 55%, #2563eb 100%);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.22);

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

/* 소셜 버튼 */
export const SocialButton = styled.button<{
  $variant: "google" | "facebook" | "instagram";
}>`
  margin-top: 0.9rem;
  width: 100%;
  height: 54px;
  padding: 0 1.2rem;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-size: 0.98rem;
  font-weight: 700;
  appearance: none;
  -webkit-appearance: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease,
    background-color 0.2s ease;

  border: ${({ $variant }) =>
    $variant === "google" ? "1px solid #dbe7f5" : "none"};

  background-color: ${({ $variant }) => {
    switch ($variant) {
      case "google":
        return "#f8fbff";
      case "facebook":
        return "#1877f2";
      case "instagram":
        return "#dd2a7b";
      default:
        return "#cbd5e1";
    }
  }};

  background-image: ${({ $variant }) =>
    $variant === "instagram"
      ? "linear-gradient(90deg, #ff8a3d 0%, #f13c79 50%, #8a3ab9 100%)"
      : "none"};

  color: ${({ $variant }) => ($variant === "google" ? "#334155" : "#ffffff")};

  box-shadow: ${({ $variant }) =>
    $variant === "google"
      ? "0 8px 20px rgba(15, 23, 42, 0.08)"
      : "0 10px 22px rgba(15, 23, 42, 0.16)"};

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.03);
    box-shadow: ${({ $variant }) =>
      $variant === "google"
        ? "0 12px 28px rgba(15, 23, 42, 0.12)"
        : "0 14px 30px rgba(15, 23, 42, 0.22)"};
      background-color: ${({ $variant }) =>
        $variant === "google" ? "#eef6ff" : undefined};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

export const FooterLinks = styled.div`
  margin-top: 1.25rem;
  text-align: center;
`;

export const FooterLink = styled.a`
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: #334155;
  }
`;