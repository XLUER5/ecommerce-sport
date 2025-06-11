import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Typography, Divider, Alert } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  LoginOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { endPoint } from "../config/config";

const { Title, Text, Link } = Typography;

const LoginModal = ({ visible, onCancel, onLogin, onShowRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      setError(null);
    } else {
      form.resetFields();
      setError(null);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const values = await form.validateFields();
      await onLogin(values);

      setLoading(false);
    } catch (error) {
      setLoading(false);

      // Manejo de errores específicos
      if (error?.response?.status === 401) {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      } else if (error?.response?.status === 404) {
        setError("Usuario no encontrado. ¿Necesitas crear una cuenta?");
      } else if (error?.response?.status >= 500) {
        setError("Error del servidor. Intenta más tarde.");
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError("Error inesperado. Intenta nuevamente.");
      }
    }
  };

  const handleCancel = () => {
    setError(null);
    onCancel();
  };

  const handleShowRegister = () => {
    setError(null);
    if (onShowRegister) {
      onShowRegister();
    }
  };

  const validateEmail = (_, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return Promise.reject(new Error("Email requerido"));
    }
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error("Email inválido"));
    }
    return Promise.resolve();
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Contraseña requerida"));
    }
    return Promise.resolve();
  };

  const handlePasswordRecovery = async () => {
    const { value: email } = await Swal.fire({
      title: "Recuperar contraseña",
      input: "email",
      inputLabel: "Ingresa tu correo electrónico",
      inputPlaceholder: "ejemplo@correo.com",
      confirmButtonText: "Enviar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Por favor ingresa tu correo";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Correo inválido";
        }
        return null;
      },
    });

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Swal.fire({
          icon: "error",
          title: "Correo inválido",
          text: "Por favor ingresa un correo válido.",
          confirmButtonText: "Cerrar",
        });
        return;
      }
      try {
        const response = await fetch(
          endPoint.baseURL + "/users/password-recovery",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "¡Listo!",
            text: "Se ha restablecido la contraseña",
            confirmButtonText: "Aceptar",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo restablecer la contraseña. Intenta más tarde.",
            confirmButtonText: "Cerrar",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo restablecer la contraseña. Intenta más tarde.",
          confirmButtonText: "Cerrar",
        });
      }
    }
  };

  return (
    <Modal
      open={visible}
      centered
      width={400}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LoginOutlined style={{ fontSize: 28, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
            Iniciar sesión
          </Title>
        </div>
      }
      onCancel={handleCancel}
      maskClosable={false}
      footer={null}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e6f7ff",
            borderRadius: "50%",
            width: 64,
            height: 64,
            marginBottom: 8,
            boxShadow: "0 2px 8px #1677ff22",
          }}
        >
          <UserOutlined style={{ fontSize: 36, color: "#1677ff" }} />
        </div>
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          Ingresa tus datos para acceder a tu cuenta
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        name="loginForm"
        onFinish={handleSubmit}
        requiredMark={false}
        autoComplete="off"
      >
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="email"
          label={
            <span>
              <MailOutlined style={{ color: "#1677ff", marginRight: 6 }} />
              Correo electrónico
            </span>
          }
          rules={[{ validator: validateEmail }]}
        >
          <Input
            type="email"
            placeholder="ejemplo@correo.com"
            size="large"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span>
              <LockOutlined style={{ color: "#1677ff", marginRight: 6 }} />
              Contraseña
            </span>
          }
          rules={[{ validator: validatePassword }]}
        >
          <Input.Password
            placeholder="Contraseña"
            size="large"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            block
            size="large"
            icon={<LoginOutlined />}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <Link
            style={{ fontSize: 13 }}
            onClick={() => {
              handlePasswordRecovery();
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Divider style={{ margin: "16px 0" }}>o</Divider>

        <div style={{ textAlign: "center" }}>
          <Button
            type="link"
            style={{ color: "#1677ff", fontWeight: 500 }}
            onClick={handleShowRegister}
            disabled={loading}
          >
            <UserOutlined /> ¿No tienes cuenta? <b>Regístrate aquí</b>
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default LoginModal;
