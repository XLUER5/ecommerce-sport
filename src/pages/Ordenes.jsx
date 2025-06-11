import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  message,
  Row,
  Col,
  Statistic,
  Descriptions,
  Modal,
  Image,
  Divider,
} from "antd";
import {
  ShoppingOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  TruckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import MainLayout from "../layout/MainLayout";
import { endPoint } from "../config/config";

const { Title, Text } = Typography;

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Cargar órdenes al montar el componente
  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
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

      const response = await fetch(`${endPoint.baseURL}/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrdenes(data);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Error al cargar las órdenes");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "orange",
      CONFIRMED: "blue",
      PREPARING: "cyan",
      SHIPPED: "purple",
      DELIVERED: "green",
      CANCELLED: "red",
    };
    return statusColors[status] || "default";
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    const statusTexts = {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmado",
      PREPARING: "En Preparación",
      SHIPPED: "Enviado",
      DELIVERED: "Entregado",
      CANCELLED: "Cancelado",
    };
    return statusTexts[status] || status;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-GT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-GT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para mostrar detalles de la orden
  const showOrderDetail = (orden) => {
    setSelectedOrder(orden);
    setDetailModalVisible(true);
  };

  // Calcular estadísticas
  const totalOrdenes = ordenes.length;
  const totalGastado = ordenes.reduce(
    (sum, orden) => sum + (orden.total || 0),
    0
  );
  const ordenesEntregadas = ordenes.filter(
    (orden) => orden.status === "DELIVERED"
  ).length;

  const columns = [
    {
      title: "Número de Orden",
      dataIndex: "numeroOrden",
      key: "numeroOrden",
      render: (numero, record) => (
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            #{numero || record.id}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {formatDate(record.createdAt)}
          </Text>
        </div>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={<ClockCircleOutlined />}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Productos",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <div>
          <Text strong>{items?.length || 0} productos</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {items?.reduce((sum, item) => sum + (item.cantidad || 0), 0)}{" "}
            unidades
          </Text>
        </div>
      ),
    },
    {
      title: "Dirección",
      dataIndex: "direccionEnvio",
      key: "direccionEnvio",
      render: (direccion) => (
        <Text style={{ fontSize: "12px" }}>{direccion || "N/A"}</Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
          Q.{(total || 0).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => showOrderDetail(record)}
          size="small"
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <ShoppingOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <Title level={2} style={{ margin: 0 }}>
              Mis Órdenes
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Historial completo de tus pedidos
          </Text>
        </div>

        {/* Estadísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total de Órdenes"
                value={totalOrdenes}
                prefix={<TruckOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Gastado"
                value={totalGastado}
                precision={2}
                prefix="Q."
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Órdenes Entregadas"
                value={ordenesEntregadas}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabla de órdenes */}
        <Card
          title="Historial de Órdenes"
          style={{ borderRadius: "12px" }}
          extra={
            <Button
              type="primary"
              ghost
              onClick={fetchOrdenes}
              loading={loading}
              style={{ borderRadius: "6px" }}
            >
              Actualizar
            </Button>
          }
        >
          <Spin spinning={loading}>
            <Table
              dataSource={ordenes}
              columns={columns}
              rowKey={(record) => record.id || record.numeroOrden}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} órdenes`,
              }}
              scroll={{ x: 800 }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px 20px" }}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <Title level={4} style={{ color: "#8c8c8c" }}>
                            No tienes órdenes aún
                          </Title>
                          <Text style={{ color: "#8c8c8c" }}>
                            Cuando realices tu primera compra, aparecerá aquí
                          </Text>
                        </div>
                      }
                    />
                  </div>
                ),
              }}
            />
          </Spin>
        </Card>

        {/* Modal de detalles de orden */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EyeOutlined />
              <span>
                Detalles de la Orden #
                {selectedOrder?.numeroOrden || selectedOrder?.id}
              </span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Cerrar
            </Button>,
          ]}
          width={800}
        >
          {selectedOrder && (
            <div>
              {/* Información general */}
              <Descriptions
                title="Información General"
                bordered
                column={2}
                style={{ marginBottom: "20px" }}
              >
                <Descriptions.Item label="Estado">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Fecha">
                  {formatDateTime(selectedOrder.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Total" span={2}>
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    Q.{(selectedOrder.total || 0).toFixed(2)}
                  </Text>
                </Descriptions.Item>
                {selectedOrder.direccionEnvio && (
                  <Descriptions.Item label="Dirección de Envío" span={2}>
                    {selectedOrder.direccionEnvio}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider />

              {/* Productos */}
              <Title level={4}>Productos</Title>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {selectedOrder.items?.map((item, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ marginBottom: "8px" }}
                  >
                    <Row gutter={[12, 12]} align="middle">
                      <Col flex="60px">
                        <Image
                          src={`/assets/img/${item.productImagen}`}
                          alt={item.productDescripcion}
                          width="50px"
                          height="50px"
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                          preview={false}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </Col>
                      <Col flex="auto">
                        <div>
                          <Text strong>{item.productDescripcion}</Text>
                          <br />
                          <Text type="secondary">
                            Q.{(item.precio || 0).toFixed(2)} x {item.cantidad}
                          </Text>
                        </div>
                      </Col>
                      <Col>
                        <Text strong style={{ color: "#1890ff" }}>
                          Q.{(item.subtotal || 0).toFixed(2)}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

              {/* Total final */}
              <Divider />
              <Row justify="end">
                <Col>
                  <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
                    Total: Q.{(selectedOrder.total || 0).toFixed(2)}
                  </Title>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Ordenes;
