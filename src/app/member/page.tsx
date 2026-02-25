"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faInstagram, faFacebookF } from "@fortawesome/free-brands-svg-icons";

import {
  PageContainer,
  StyledCard,
  LeftImage,
  FormWrapper,
  GenderLabel,
  AddressGroup,
  AddressButton,
  SubmitButton,
  SocialButton,
  FooterLinks,
  FooterLink,
} from "@/styled/Member.styles";

// ✅ 다음 주소 API 타입 선언
declare global {
  interface Window {
    daum: any;
  }
}

type Gender = "male" | "female" | "other" | "";

interface MemberForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  gender: Gender;
  companyName: string;
  position: string;
  tel: string;
  address: string;
  detailAddress: string;
}

const BACKEND_BASE_URL = "http://localhost:9999";

export default function Member() {
  const router = useRouter();

  const [form, setForm] = useState<MemberForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    gender: "",
    companyName: "",
    position: "",
    tel: "",
    address: "",
    detailAddress: "",
  });

  /* =======================
     공통 입력 핸들러
  ======================= */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      gender: e.target.value as Gender,
    }));
  };

  /* =======================
     회원가입 제출
  ======================= */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.password !== form.repeatPassword) {
      alert("비밀번호가 일치하지 않습니다");
      return;
    }

    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/members/register`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // ✅ 이거 한 줄만 추가
        }
      );

      alert("회원가입 성공 🎉");

      // ✅ 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("회원가입 중 오류 발생");
    }
  };

  /* =======================
     주소 검색
  ======================= */
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.postcode) {
      alert("주소 검색 스크립트 로딩 중입니다");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setForm((prev) => ({
          ...prev,
          address: data.address,
        }));
      },
    }).open();
  };

  /* =======================
     소셜 회원가입
  ======================= */
  const socialLogin = (provider: string) => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <PageContainer>
      {/* 다음 주소 API */}
      <script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
      />

      <StyledCard>
        <StyledCard.Body className="p-0">
          <Row>
            <Col lg={5} className="d-none d-lg-block p-0">
              <LeftImage />
            </Col>

            <Col lg={7}>
              <FormWrapper>
                <h1 className="h4 mb-4">Create an Account!</h1>

                <Form onSubmit={handleSubmit}>
                  <Row className="mb-2">
                    <Col sm={6}>
                      <Form.Control
                        placeholder="이름"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Control
                        placeholder="성"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>

                  <Form.Control
                    className="mb-2"
                    type="email"
                    placeholder="이메일"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />

                  <Row className="mb-2">
                    <Col sm={6}>
                      <Form.Control
                        type="password"
                        placeholder="비밀번호"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Control
                        type="password"
                        placeholder="비밀번호 확인"
                        name="repeatPassword"
                        value={form.repeatPassword}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>

                  {/* 성별 */}
                  <div className="mb-3">
                    <GenderLabel>성별 :</GenderLabel>
                    {["male", "female", "other"].map((g) => (
                      <Form.Check
                        key={g}
                        inline
                        type="radio"
                        label={g}
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={handleGenderChange}
                      />
                    ))}
                  </div>

                  <div className="d-flex mb-2">
                    <Form.Control
                      placeholder="회사명"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                    />
                    <Form.Control
                      className="mx-3"
                      placeholder="직급"
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                    />
                    <Form.Control
                      placeholder="전화번호"
                      name="tel"
                      value={form.tel}
                      onChange={handleChange}
                    />
                  </div>

                  <AddressGroup>
                    <Form.Control
                      readOnly
                      name="address"
                      value={form.address}
                    />
                    <AddressButton
                      type="button"
                      onClick={handleAddressSearch}
                    >
                      주소검색
                    </AddressButton>
                  </AddressGroup>

                  <Form.Control
                    className="mt-2"
                    placeholder="상세주소"
                    name="detailAddress"
                    value={form.detailAddress}
                    onChange={handleChange}
                  />

                  <SubmitButton type="submit">
                    회원가입
                  </SubmitButton>
                </Form>

                <hr />

                <SocialButton
                  bg="#db4437"
                  onClick={() => socialLogin("google")}
                >
                  <FontAwesomeIcon icon={faGoogle} />
                  Register with Google
                </SocialButton>

                <SocialButton
                  bg="#E1306c"
                  onClick={() => socialLogin("instagram")}
                >
                  <FontAwesomeIcon icon={faInstagram} />
                  Register with Instagram
                </SocialButton>

                <SocialButton
                  bg="#1877f2"
                  onClick={() => socialLogin("facebook")}
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                  Register with Facebook
                </SocialButton>

                <FooterLinks>
                  <FooterLink href="/login">
                    Already have an account? Login!
                  </FooterLink>
                </FooterLinks>
              </FormWrapper>
            </Col>
          </Row>
        </StyledCard.Body>
      </StyledCard>
    </PageContainer>
  );
}
