import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  Typography,
  Divider,
  Space,
  message,
  DatePicker,
  Grid,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import MainLayout from "../layout/MainLayout";
import dayjs from "dayjs";
import { endPoint } from "../config/config";
import { AuthContext } from "../auth/context/AuthContext";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Profile = () => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user, logged, login, logout } = useContext(AuthContext);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Restaurar los valores originales
    if (dataLoaded) {
      form.setFieldsValue({
        nombre: userData.nombre,
        apellido: userData.apellidos,
        fechaNacimiento: userData.fechaNacimiento
          ? dayjs(userData.fechaNacimiento)
          : null,
        direccion: userData.direccionEnvio,
        email: userData.email,
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      const formValues = {
        nombre: userData.nombre || "",
        apellido: userData.apellidos || "",
        fechaNacimiento: userData.fechaNacimiento
          ? dayjs(userData.fechaNacimiento)
          : null,
        direccion: userData.direccionEnvio || "",
        email: userData.email || "",
      };

      form.setFieldsValue(formValues);
      setDataLoaded(true);
    }
  }, [userData, form]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("data-ecommerce");
    if (!token) {
      message.error("No se encontró el token de autenticación");
      return;
    }
    const parsedToken = JSON.parse(token);
    if (!parsedToken || !parsedToken.token) {
      message.error("Token de autenticación inválido");
      return;
    }

    try {
      const response = await fetch(`${endPoint.baseURL}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener el perfil");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      message.error("No se pudo cargar el perfil: " + error.message);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        nombre: values.nombre.trim(),
        apellidos: values.apellido.trim(),
        direccionEnvio: values.direccion.trim(),
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.format("YYYY-MM-DD")
          : null,
      };

      const token = localStorage.getItem("data-ecommerce");
      if (!token) {
        message.error("No se encontró el token de autenticación");
        return;
      }
      const parsedToken = JSON.parse(token);
      if (!parsedToken || !parsedToken.token) {
        message.error("Token de autenticación inválido");
        return;
      }

      const response = await fetch(`${endPoint.baseURL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken.token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }

      const updatedData = await response.json();

      message.success("Perfil actualizado correctamente");
      setEditMode(false);

      setUserData((prev) => ({
        ...prev,
        nombre: values.nombre,
        apellidos: values.apellido,
        direccionEnvio: values.direccion,
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.format("YYYY-MM-DD")
          : null,
      }));
    } catch (error) {
      message.error("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div
        style={{
          padding: isMobile ? "20px" : "40px 20px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header simple */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Title
            level={2}
            style={{
              margin: "0 0 8px 0",
              color: "#1f2937",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Mi Perfil
          </Title>
          <Text style={{ color: "#6b7280", fontSize: "16px" }}>
            Gestiona tu información personal
          </Text>
        </div>

        {/* Card principal */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header de la card */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                {userData.nombre || "Cargando..."} {userData.apellidos || ""}
              </Title>
              <Text style={{ color: "#6b7280" }}>
                {userData.email || "Cargando..."}
              </Text>
            </div>

            {!editMode ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                disabled={!dataLoaded}
                style={{
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  height: "36px",
                }}
              >
                Editar
              </Button>
            ) : (
              <Space>
                <Button
                  onClick={handleCancel}
                  style={{ borderRadius: "8px", height: "36px" }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => form.submit()}
                  style={{
                    borderRadius: "8px",
                    background: "#10b981",
                    border: "none",
                    height: "36px",
                  }}
                >
                  Guardar
                </Button>
              </Space>
            )}
          </div>

          <Divider style={{ margin: "0 0 24px 0" }} />

          {/* Formulario */}
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <UserOutlined
                        style={{ color: "#667eea", fontSize: "12px" }}
                      />
                      Nombre
                    </span>
                  }
                  name="nombre"
                  rules={[
                    { required: true, message: "Por favor ingresa tu nombre" },
                  ]}
                >
                  <Input
                    placeholder="Ingresa tu nombre"
                    disabled={!editMode}
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      background: editMode ? "#fff" : "#f9fafb",
                      border: editMode
                        ? "1px solid #d1d5db"
                        : "1px solid #e5e7eb",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <UserOutlined
                        style={{ color: "#667eea", fontSize: "12px" }}
                      />
                      Apellido
                    </span>
                  }
                  name="apellido"
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingresa tu apellido",
                    },
                  ]}
                >
                  <Input
                    placeholder="Ingresa tu apellido"
                    disabled={!editMode}
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      background: editMode ? "#fff" : "#f9fafb",
                      border: editMode
                        ? "1px solid #d1d5db"
                        : "1px solid #e5e7eb",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MailOutlined
                    style={{ color: "#667eea", fontSize: "12px" }}
                  />
                  Correo Electrónico
                </span>
              }
              name="email"
            >
              <Input
                placeholder="correo@ejemplo.com"
                disabled
                style={{
                  borderRadius: "8px",
                  height: "40px",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#6b7280",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CalendarOutlined
                    style={{ color: "#667eea", fontSize: "12px" }}
                  />
                  Fecha de Nacimiento
                </span>
              }
              name="fechaNacimiento"
              rules={[
                {
                  required: true,
                  message: "Por favor selecciona tu fecha de nacimiento",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const today = dayjs();
                    const age = today.diff(value, "year");
                    if (age < 18) {
                      return Promise.reject(
                        new Error("Debes ser mayor de 18 años")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                placeholder="Selecciona fecha"
                disabled={true}
                style={{
                  borderRadius: "8px",
                  height: "40px",
                  width: "100%",
                  background: editMode ? "#fff" : "#f9fafb",
                  border: editMode ? "1px solid #d1d5db" : "1px solid #e5e7eb",
                }}
                format="DD/MM/YYYY"
                onChange={(date) =>
                  form.setFieldsValue({ fechaNacimiento: date })
                }
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <HomeOutlined
                    style={{ color: "#667eea", fontSize: "12px" }}
                  />
                  Dirección
                </span>
              }
              name="direccion"
            >
              <Input.TextArea
                placeholder="Ingresa tu dirección completa"
                disabled={!editMode}
                rows={3}
                style={{
                  borderRadius: "8px",
                  background: editMode ? "#fff" : "#f9fafb",
                  border: editMode ? "1px solid #d1d5db" : "1px solid #e5e7eb",
                  resize: "none",
                }}
              />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
