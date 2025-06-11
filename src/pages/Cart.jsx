// pages/CartPage.js
import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  InputNumber,
  Image,
  Row,
  Col,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import MainLayout from "../layout/MainLayout";
import { useCart } from "../auth/context/CartContext";
import CheckoutModal from "../components/order/CheckoutModal";

const { Title, Text } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Estados para el modal
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  // Función helper para obtener el precio del producto
  const getProductPrice = (record) => {
    return record.productMonto || record.producto?.monto || 0;
  };

  // Función helper para obtener la descripción del producto
  const getProductDescription = (record) => {
    return (
      record.productDescripcion || record.producto?.descripcion || "Producto"
    );
  };

  // Función helper para obtener la imagen del producto
  const getProductImage = (record) => {
    return record.productImagen || record.producto?.imagen || "default.jpg";
  };

  // FUNCIÓN ACTUALIZADA: Usar el ID del item del carrito (no del producto)
  const handleQuantityChange = async (record, newQuantity) => {
    if (newQuantity <= 0) {
      // Usar el ID del item del carrito para remover
      await removeFromCart(record.id);
    } else {
      // Usar el ID del item del carrito para actualizar
      await updateQuantity(record.id, newQuantity);
    }
  };

  // FUNCIÓN ACTUALIZADA: Remover usando el ID del item del carrito
  const handleRemoveItem = async (record) => {
    await removeFromCart(record.id);
  };

  // Manejar éxito del checkout
  const handleCheckoutSuccess = (data) => {
    // Opcional: redirigir o mostrar mensaje adicional
    console.log("Pedido confirmado:", data);
  };

  const columns = [
    {
      title: "Producto",
      dataIndex: "producto",
      key: "producto",
      render: (producto, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "6px",
              background: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "4px",
            }}
          >
            <Image
              src={`/assets/img/${getProductImage(record)}`}
              alt={getProductDescription(record)}
              width="52px"
              height="52px"
              style={{ objectFit: "cover", borderRadius: "4px" }}
              preview={false}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
          <div>
            <Text strong style={{ fontSize: "14px" }}>
              {getProductDescription(record)}
            </Text>
            {/* Mostrar ID del item para debugging (opcional, remover en producción) */}
            {process.env.NODE_ENV === "development" && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Item ID: {record.id}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Precio",
      key: "precio",
      render: (_, record) => (
        <Text
          style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff" }}
        >
          Q.{getProductPrice(record).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad, record) => (
        <InputNumber
          min={1}
          value={cantidad}
          onChange={(value) => handleQuantityChange(record, value)}
          disabled={loading || !record.id} // Deshabilitar si no hay ID
          style={{ width: "80px" }}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => (
        <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
          Q.{(getProductPrice(record) * (record.cantidad || 0)).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record)}
          disabled={loading || !record.id} // Deshabilitar si no hay ID
        >
          Remover
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Space align="center" style={{ marginBottom: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
              style={{ padding: "4px 8px" }}
            >
              Volver a comprar
            </Button>
          </Space>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <ShoppingCartOutlined
              style={{ fontSize: "24px", color: "#1890ff" }}
            />
            <Title level={2} style={{ margin: 0 }}>
              Mi Carrito de Compras
            </Title>
          </div>

          {totalItems > 0 && (
            <Text type="secondary" style={{ fontSize: "16px" }}>
              {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu
              carrito
            </Text>
          )}
        </div>

        <Spin spinning={loading}>
          {items.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "60px 20px" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Title
                      level={3}
                      style={{ color: "#8c8c8c", marginBottom: "16px" }}
                    >
                      Tu carrito está vacío
                    </Title>
                    <Text style={{ color: "#8c8c8c", fontSize: "16px" }}>
                      Explora nuestros productos y agrega algunos a tu carrito
                    </Text>
                  </div>
                }
              />
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/")}
                style={{
                  marginTop: "24px",
                  borderRadius: "8px",
                  height: "48px",
                  padding: "0 32px",
                  fontSize: "16px",
                }}
              >
                Explorar productos
              </Button>
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {/* Tabla de productos */}
              <Col xs={24} lg={16}>
                <Card
                  title="Productos en tu carrito"
                  extra={
                    <Button
                      type="text"
                      danger
                      onClick={clearCart}
                      disabled={loading}
                    >
                      Limpiar carrito
                    </Button>
                  }
                  style={{ borderRadius: "12px" }}
                >
                  <Table
                    dataSource={items}
                    columns={columns}
                    rowKey={(record) =>
                      record.id || `temp_${record.productId}_${Date.now()}`
                    }
                    pagination={false}
                    scroll={{ x: 600 }}
                    locale={{
                      emptyText: (
                        <div style={{ padding: "20px" }}>
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No hay productos en el carrito"
                          />
                        </div>
                      ),
                    }}
                  />
                </Card>
              </Col>

              {/* Resumen del pedido */}
              <Col xs={24} lg={8}>
                <Card
                  title="Resumen del pedido"
                  style={{
                    borderRadius: "12px",
                    position: "sticky",
                    top: "24px",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Row
                        justify="space-between"
                        style={{ marginBottom: "8px" }}
                      >
                        <Col>
                          <Text>Productos ({totalItems}):</Text>
                        </Col>
                        <Col>
                          <Text>Q.{totalPrice.toFixed(2)}</Text>
                        </Col>
                      </Row>

                      <Row
                        justify="space-between"
                        style={{ marginBottom: "8px" }}
                      >
                        <Col>
                          <Text>Envío:</Text>
                        </Col>
                        <Col>
                          <Text>Gratis</Text>
                        </Col>
                      </Row>

                      <Divider style={{ margin: "12px 0" }} />

                      <Row
                        justify="space-between"
                        style={{ marginBottom: "16px" }}
                      >
                        <Col>
                          <Text
                            style={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            Total:
                          </Text>
                        </Col>
                        <Col>
                          <Text
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#1890ff",
                            }}
                          >
                            Q.{totalPrice.toFixed(2)}
                          </Text>
                        </Col>
                      </Row>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      icon={<CreditCardOutlined />}
                      block
                      disabled={loading || totalItems === 0}
                      onClick={() => setCheckoutModalVisible(true)}
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
                      onClick={() => navigate("/")}
                      style={{
                        borderRadius: "8px",
                        height: "40px",
                      }}
                    >
                      Continuar comprando
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </Spin>

        {/* CheckoutModal */}
        <CheckoutModal
          visible={checkoutModalVisible}
          onClose={() => setCheckoutModalVisible(false)}
          onSuccess={handleCheckoutSuccess}
        />
      </div>
    </MainLayout>
  );
};

export default Cart;
