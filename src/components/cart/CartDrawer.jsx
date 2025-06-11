import React, { useState } from "react";
import {
  Drawer,
  Button,
  Typography,
  Space,
  InputNumber,
  Image,
  Divider,
  Empty,
  Spin,
  Row,
  Col,
  Card,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  MinusOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useCart } from "../../auth/context/CartContext";
import { useNavigate } from "react-router";
import CheckoutModal from "../order/CheckoutModal";

const { Title, Text } = Typography;

const CartDrawer = ({ visible, onClose }) => {
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleOpenCheckout = () => {
    setCheckoutModalVisible(true);
  };

  const handleCheckoutSuccess = (data) => {
    onClose();
    setCheckoutModalVisible(false);
  };

  const CartItem = ({ item }) => (
    <Card
      size="small"
      style={{
        marginBottom: "12px",
        borderRadius: "8px",
        border: "1px solid #f0f0f0",
      }}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col flex="80px">
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "6px",
              background: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              padding: "4px",
            }}
          >
            <Image
              src={`/assets/img/${item.productImagen}`}
              alt={item.productDescripcion}
              width="62px"
              height="62px"
              style={{ objectFit: "cover", borderRadius: "4px" }}
              preview={false}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
        </Col>

        {/* Información del producto */}
        <Col flex="auto">
          <div style={{ paddingRight: "8px" }}>
            <Title
              level={5}
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                lineHeight: "1.3",
                color: "#1f2937",
              }}
            >
              {item.productDescripcion}
            </Title>
            <Text
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1890ff",
              }}
            >
              Q.{item.productMonto}
            </Text>
          </div>
        </Col>

        {/* Controles de cantidad */}
        <Col>
          <Space
            direction="vertical"
            size="small"
            style={{ textAlign: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Button
                size="small"
                icon={<MinusOutlined />}
                onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                disabled={loading || !item.id}
                style={{
                  width: "24px",
                  height: "24px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <InputNumber
                size="small"
                min={1}
                value={item.cantidad}
                onChange={(value) => handleQuantityChange(item.id, value)}
                disabled={loading || !item.id}
                style={{
                  width: "50px",
                  textAlign: "center",
                }}
                controls={false}
              />
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                disabled={loading || !item.id}
                style={{
                  width: "24px",
                  height: "24px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </div>
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeFromCart(item.id)}
              disabled={loading || !item.id}
              style={{
                padding: "2px 4px",
                height: "auto",
                fontSize: "12px",
              }}
            >
              Remover
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Subtotal */}
      <div style={{ marginTop: "8px", textAlign: "right" }}>
        <Text style={{ fontSize: "12px", color: "#666" }}>Subtotal:</Text>
        <Text
          style={{ fontSize: "14px", fontWeight: "bold", marginLeft: "4px" }}
        >
          Q.{((item.productMonto || 0) * (item.cantidad || 0)).toFixed(2)}
        </Text>
      </div>
    </Card>
  );

  return (
    <>
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCartOutlined style={{ color: "#1890ff" }} />
            <span>Mi Carrito</span>
            {totalItems > 0 && (
              <span
                style={{
                  background: "#1890ff",
                  color: "white",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {totalItems}
              </span>
            )}
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={400}
        styles={{
          body: { padding: "16px" },
        }}
        extra={
          items.length > 0 && (
            <Button
              type="text"
              size="small"
              onClick={clearCart}
              disabled={loading}
              style={{ color: "#ff4d4f" }}
            >
              Limpiar todo
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          {items.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: "center" }}>
                  <Title
                    level={4}
                    style={{ color: "#8c8c8c", marginBottom: "8px" }}
                  >
                    Tu carrito está vacío
                  </Title>
                  <Text style={{ color: "#8c8c8c" }}>
                    Agrega algunos productos para comenzar
                  </Text>
                </div>
              }
              style={{ margin: "60px 0" }}
            />
          ) : (
            <div>
              {/* Lista de productos */}
              <div
                style={{
                  marginBottom: "20px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {items.map((item) => (
                  <CartItem
                    key={item.id || `temp_${item.productId}`}
                    item={item}
                  />
                ))}
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* Resumen del carrito */}
              <div style={{ marginBottom: "20px" }}>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>
                    <Text style={{ fontSize: "14px" }}>
                      Total de productos:
                    </Text>
                  </Col>
                  <Col>
                    <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {totalItems}
                    </Text>
                  </Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: "16px" }}>
                  <Col>
                    <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
                      Total a pagar:
                    </Text>
                  </Col>
                  <Col>
                    <Text
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#1890ff",
                      }}
                    >
                      Q.{(totalPrice || 0).toFixed(2)}
                    </Text>
                  </Col>
                </Row>
              </div>

              {/* Botones de acción */}
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  block
                  disabled={loading || totalItems === 0}
                  onClick={handleOpenCheckout}
                  style={{
                    borderRadius: "8px",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  Confirmar Pedido
                </Button>

                <Button
                  size="large"
                  block
                  icon={<EyeOutlined />}
                  onClick={() => {
                    onClose();
                    navigate("/carrito");
                  }}
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                  }}
                >
                  Ver carrito completo
                </Button>

                <Button
                  size="large"
                  block
                  onClick={onClose}
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    marginTop: "8px",
                  }}
                >
                  Continuar comprando
                </Button>
              </Space>
            </div>
          )}
        </Spin>
      </Drawer>

      <CheckoutModal
        visible={checkoutModalVisible}
        onClose={() => setCheckoutModalVisible(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
};

export default CartDrawer;
