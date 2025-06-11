// components/order/CheckoutModal.js
import React, { useState, useContext } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  message,
  Spin,
} from "antd";
import {
  CreditCardOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../auth/context/AuthContext";
import { useCart } from "../../auth/context/CartContext";
import { endPoint } from "../../config/config";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CheckoutModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const handleConfirmOrder = async (values) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("data-ecommerce");
      if (!token) {
        message.error("No se encontró token de autenticación");
        return;
      }

      const parsedToken = JSON.parse(token);
      const authToken = parsedToken?.token;

      if (!authToken) {
        message.error("Token inválido");
        return;
      }

      const orderData = {
        metodoPago: values.metodoPago,
        direccionEnvio: editingAddress
          ? values.direccionEnvio
          : user?.direccion,
        notas: values.notas || null,
      };

      const response = await fetch(`${endPoint.baseURL}/orders/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        // Limpiar el carrito después de confirmar
        await clearCart();

        // Mostrar mensaje de éxito
        message.success(
          `¡Pedido confirmado exitosamente! Número de orden: ${
            result.numeroOrden || result.id
          }`
        );

        // Llamar callback de éxito si existe
        if (onSuccess) {
          onSuccess({
            orderNumber: result.numeroOrden || result.id,
            orderData: result,
            items,
            totalPrice,
          });
        }

        // Cerrar modal
        onClose();
        form.resetFields();
        setEditingAddress(false);
      } else {
        message.error(result.message || "Error al confirmar el pedido");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      message.error("Error al confirmar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
    setEditingAddress(false);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <span>Confirmar Pedido</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleConfirmOrder}
        initialValues={{
          metodoPago: "TARJETA_CREDITO",
        }}
      >
        <Spin spinning={loading}>
          {/* Resumen del pedido */}
          <Card
            title="Resumen del Pedido"
            size="small"
            style={{ marginBottom: "20px" }}
          >
            <Row justify="space-between" style={{ marginBottom: "8px" }}>
              <Col>
                <Text>Productos ({totalItems}):</Text>
              </Col>
              <Col>
                <Text strong>Q.{totalPrice.toFixed(2)}</Text>
              </Col>
            </Row>
            <Row justify="space-between" style={{ marginBottom: "8px" }}>
              <Col>
                <Text>Envío:</Text>
              </Col>
              <Col>
                <Text>Gratis</Text>
              </Col>
            </Row>
            <Divider style={{ margin: "8px 0" }} />
            <Row justify="space-between">
              <Col>
                <Text strong style={{ fontSize: "16px" }}>
                  Total:
                </Text>
              </Col>
              <Col>
                <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                  Q.{totalPrice.toFixed(2)}
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Dirección de envío */}
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <EnvironmentOutlined />
                <span>Dirección de Envío</span>
              </div>
            }
            size="small"
            style={{ marginBottom: "20px" }}
            extra={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setEditingAddress(!editingAddress)}
                style={{ padding: 0 }}
              >
                {editingAddress ? "Cancelar" : "Editar"}
              </Button>
            }
          >
            {!editingAddress ? (
              <div>
                <Paragraph style={{ margin: 0 }}>
                  <Text strong>{user?.nombre || "Usuario"}</Text>
                  <br />
                  {user?.direccion || "No hay dirección registrada"}
                  <br />
                  {user?.telefono && (
                    <>
                      Tel: {user.telefono}
                      <br />
                    </>
                  )}
                  {user?.email}
                </Paragraph>
              </div>
            ) : (
              <Form.Item
                name="direccionEnvio"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingresa la dirección de envío",
                  },
                ]}
              >
                <TextArea
                  placeholder="Ingresa la nueva dirección de envío..."
                  rows={3}
                />
              </Form.Item>
            )}
          </Card>

          {/* Método de pago */}
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <CreditCardOutlined />
                <span>Método de Pago</span>
              </div>
            }
            size="small"
            style={{ marginBottom: "20px" }}
          >
            <Form.Item
              name="metodoPago"
              rules={[
                { required: true, message: "Selecciona un método de pago" },
              ]}
            >
              <Select size="large">
                <Select.Option value="TARJETA_CREDITO">
                  Tarjeta de Crédito
                </Select.Option>
                <Select.Option value="TARJETA_DEBITO">
                  Tarjeta de Débito
                </Select.Option>
                <Select.Option value="EFECTIVO">
                  Efectivo (Contra entrega)
                </Select.Option>
                <Select.Option value="TRANSFERENCIA">
                  Transferencia Bancaria
                </Select.Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Notas adicionales */}
          <Card
            title="Notas del Pedido (Opcional)"
            size="small"
            style={{ marginBottom: "20px" }}
          >
            <Form.Item name="notas">
              <TextArea
                placeholder="Instrucciones especiales para la entrega..."
                rows={3}
              />
            </Form.Item>
          </Card>

          {/* Botones de acción */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Button
                size="large"
                block
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            </Col>
          </Row>
        </Spin>
      </Form>
    </Modal>
  );
};

export default CheckoutModal;
