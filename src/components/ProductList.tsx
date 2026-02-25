"use client";
import { Card, Button, Row, Col } from "react-bootstrap";

type Product = {
  id: number;
  title: string;
  desc: string;
  price: number;
  imageUrl?: string;
};

type Props = {
  products: Product[];
  onDelete: (id: number) => void;
};

export default function ProductList({ products, onDelete }: Props) {
  return (
    <Row className="g-3">
      {products.map((p) => (
        <Col key={p.id} md={3}>
          <Card>
            {p.imageUrl ? (
              <Card.Img
                variant="top"
                src={`http://localhost:9999${p.imageUrl}?v=${Date.now()}`}
              />
            ) : (
              <div style={{ height: 200, textAlign: "center" }}>
                이미지 없음
              </div>
            )}

            <Card.Body>
              <Card.Title>{p.title}</Card.Title>
              <Card.Text>{p.desc}</Card.Text>
              <Card.Text className="fw-bold">
                {p.price.toLocaleString()}원
              </Card.Text>

              <Button
                variant="outline-danger"
                onClick={() => onDelete(p.id)}
              >
                삭제
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
