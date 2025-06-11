import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Rate,
  Space,
  Tag,
  Grid,
  Input,
  Badge,
  InputNumber,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import MainLayout from "../layout/MainLayout";
import { endPoint } from "../config/config";
import { useCart } from "../auth/context/CartContext";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const Home = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Hook del carrito
  const {
    addToCart,
    getCartItem,
    updateQuantity,
    removeFromCart,
    isInCart,
    loading,
  } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrar productos cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(endPoint.baseURL + "/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.error("Error fetching products:", data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getGridCols = () => {
    if (isMobile) return { xs: 24, sm: 12 };
    return { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const handleQuantityChange = async (product, newQuantity) => {
    const cartItem = getCartItem(product.id);
    if (cartItem) {
      if (newQuantity <= 0) {
        await removeFromCart(cartItem.id);
      } else {
        await updateQuantity(cartItem.id, newQuantity);
      }
    }
  };

  const ProductCard = ({ product }) => {
    const cartItem = getCartItem(product.id);
    const inCart = isInCart(product.id);

    return (
      <Card
        hoverable
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #f0f0f0",
          height: "100%",
          transition: "all 0.3s ease",
          opacity: loading ? 0.7 : 1,
        }}
        cover={
          <div
            style={{
              height: "180px",
              background: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              position: "relative",
              padding: "20px",
            }}
          >
            {product.tag && (
              <Tag
                color={product.tagColor}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  border: "none",
                  fontWeight: "500",
                  fontSize: "11px",
                }}
              >
                {product.tag}
              </Tag>
            )}
            {product.discount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#ff4d4f",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                -{product.discount}%
              </div>
            )}
            <img
              src={`/assets/img/${product.imagen}`}
              alt={product.descripcion}
              style={{
                width: "220px",
                height: "220px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </div>
        }
      >
        <div
          style={{
            height: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Title
              level={5}
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                lineHeight: "1.3",
              }}
            >
              {product.descripcion}
            </Title>
          </div>

          <div>
            <div style={{ marginBottom: "12px" }}>
              <Space align="baseline">
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  Q.{product.monto}
                </Text>
              </Space>
            </div>

            {/* Controles del carrito */}
            {!inCart ? (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="small"
                loading={loading}
                onClick={() => handleAddToCart(product)}
                style={{
                  borderRadius: "6px",
                  fontWeight: "500",
                  width: "100%",
                }}
              >
                Agregar
              </Button>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Button
                  size="small"
                  icon={<MinusOutlined />}
                  loading={loading}
                  onClick={() =>
                    handleQuantityChange(product, (cartItem?.cantidad || 1) - 1)
                  }
                  style={{ borderRadius: "6px" }}
                />
                <InputNumber
                  size="small"
                  min={0}
                  value={cartItem?.cantidad || 0}
                  onChange={(value) => handleQuantityChange(product, value)}
                  disabled={loading}
                  style={{
                    width: "60px",
                    textAlign: "center",
                    borderRadius: "6px",
                  }}
                />
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  loading={loading}
                  onClick={() =>
                    handleQuantityChange(product, (cartItem?.cantidad || 0) + 1)
                  }
                  style={{ borderRadius: "6px" }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div style={{ padding: isMobile ? "16px" : "24px" }}>
        {/* Buscador y filtros */}
        <div style={{ marginBottom: "24px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Search
                placeholder="Buscar productos..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: isMobile ? "left" : "right" }}>
                <Text type="secondary">
                  Mostrando {filteredProducts.length} productos
                  {searchTerm && ` de ${products.length} total`}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Mensaje si no hay productos */}
        {filteredProducts.length === 0 && searchTerm && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              No se encontraron productos para "{searchTerm}"
            </Text>
          </div>
        )}

        {/* Grid de productos */}
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product) => (
            <Col {...getGridCols()} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>

        {/* Botón cargar más */}
        {filteredProducts.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              type="primary"
              size="large"
              style={{
                borderRadius: "8px",
                padding: "0 32px",
                fontWeight: "500",
              }}
            >
              Cargar más productos
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Home;
