import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  DatePicker,
  Progress,
  Space,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  HomeOutlined,
  CalendarOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const RegisterModal = ({
  visible,
  onCancel,
  onRegister,
  loading: externalLoading = false,
  onShowLogin,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      setError(null);
      setPasswordStrength(0);
      setPasswordFeedback("");
    } else {
      form.resetFields();
      setError(null);
      setPasswordStrength(0);
      setPasswordFeedback("");
    }
  }, [visible, form]);

  const evaluatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 25;
    else feedback.push("8+ caracteres");

    if (/[A-Z]/.test(password)) strength += 25;
    else feedback.push("mayúscula");

    if (/[a-z]/.test(password)) strength += 25;
    else feedback.push("minúscula");

    if (/[\d\W]/.test(password)) strength += 25;
    else feedback.push("número/símbolo");

    setPasswordStrength(strength);

    if (feedback.length > 0) {
      setPasswordFeedback(`Falta: ${feedback.join(", ")}`);
    } else {
      setPasswordFeedback("¡Segura!");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const values = await form.validateFields();

      const formattedData = {
        ...values,
        fechaNacimiento: values.fechaNacimiento.format("YYYY-MM-DD"),
      };

      if (onRegister) {
        await onRegister(formattedData);
      }

      form.resetFields();
      setLoading(false);
    } catch (error) {
      setLoading(false);

      if (error?.response?.status === 409) {
        setError("Este correo ya está registrado.");
      } else if (error?.response?.status === 400) {
        setError("Datos inválidos. Verifica la información.");
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

  const handleShowLogin = () => {
    handleCancel();
    if (onShowLogin) {
      onShowLogin();
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

  const validateName = (fieldName) => (_, value) => {
    if (!value?.trim()) {
      return Promise.reject(new Error(`${fieldName} requerido`));
    }
    if (value.trim().length < 2) {
      return Promise.reject(new Error(`Mín. 2 caracteres`));
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
      return Promise.reject(new Error(`Solo letras`));
    }
    return Promise.resolve();
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Contraseña requerida"));
    }
    if (value.length < 8) {
      return Promise.reject(new Error("Mín. 8 caracteres"));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])/.test(value)) {
      return Promise.reject(
        new Error("Debe incluir mayúsculas, minúsculas y números/símbolos")
      );
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");
    if (!value) {
      return Promise.reject(new Error("Confirma contraseña"));
    }
    if (value !== password) {
      return Promise.reject(new Error("No coinciden"));
    }
    return Promise.resolve();
  };

  const validateBirthDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Fecha requerida"));
    }

    const today = dayjs();
    const birthDate = dayjs(value);
    const age = today.diff(birthDate, "year");

    if (age < 18) {
      return Promise.reject(new Error("Debes ser +18"));
    }

    if (birthDate.isAfter(today)) {
      return Promise.reject(new Error("Fecha inválida"));
    }

    return Promise.resolve();
  };

  const validateAddress = (_, value) => {
    if (!value?.trim()) {
      return Promise.reject(new Error("Dirección requerida"));
    }
    if (value.trim().length < 10) {
      return Promise.reject(new Error("Dirección muy corta"));
    }
    return Promise.resolve();
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "#ff4d4f";
    if (passwordStrength < 75) return "#faad14";
    return "#52c41a";
  };

  const isFormLoading = loading || externalLoading;

  return (
    <Modal
      open={visible}
      title="Crear cuenta"
      onCancel={handleCancel}
      width={580}
      centered
      maskClosable={false}
      footer={null}
      styles={{
        body: { padding: "20px 24px" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="registerForm"
        onFinish={handleSubmit}
        autoComplete="off"
        size="middle"
        scrollToFirstError
      >
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 12 }}
          />
        )}

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[{ validator: validateEmail }]}
          style={{ marginBottom: 12 }}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
        </Form.Item>

        {/* Nombre y Apellido */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ validator: validateName("Nombre") }]}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nombre"
                autoComplete="given-name"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="apellidos"
              label="Apellidos"
              rules={[{ validator: validateName("Apellidos") }]}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Apellidos"
                autoComplete="family-name"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Fecha y Dirección */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="fechaNacimiento"
              label={
                <Space size={4}>
                  Nacimiento
                  <Tooltip title="Mayor de 18 años">
                    <InfoCircleOutlined
                      style={{ color: "#8c8c8c", fontSize: 12 }}
                    />
                  </Tooltip>
                </Space>
              }
              rules={[{ validator: validateBirthDate }]}
              style={{ marginBottom: 12 }}
            >
              <DatePicker
                placeholder="DD/MM/YYYY"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(current) =>
                  current &&
                  (current > dayjs() || current < dayjs().subtract(120, "year"))
                }
                showToday={false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="direccionEnvio"
              label="Dirección"
              rules={[{ validator: validateAddress }]}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="Dirección completa"
                autoComplete="address-line1"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Contraseñas */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ validator: validatePassword }]}
              style={{ marginBottom: 8 }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                onChange={(e) => evaluatePasswordStrength(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="confirmPassword"
              label="Confirmar"
              rules={[{ validator: validateConfirmPassword }]}
              dependencies={["password"]}
              style={{ marginBottom: 8 }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Repetir contraseña"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Indicador de fortaleza */}
        {passwordStrength > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Progress
              percent={passwordStrength}
              strokeColor={getPasswordStrengthColor()}
              showInfo={false}
              size="small"
            />
            <div
              style={{
                fontSize: "11px",
                color: getPasswordStrengthColor(),
                marginTop: 2,
              }}
            >
              {passwordFeedback}
            </div>
          </div>
        )}

        {/* Botones */}
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isFormLoading}
            block
            size="large"
          >
            {isFormLoading ? "Creando..." : "Crear cuenta"}
          </Button>

          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "#595959", marginRight: 8 }}>
              ¿Ya tienes cuenta?
            </span>
            <Button
              type="link"
              style={{ padding: 0, fontSize: 13, fontWeight: 500 }}
              onClick={handleShowLogin}
              disabled={isFormLoading}
            >
              Inicia sesión
            </Button>
          </div>
        </Space>
      </Form>
    </Modal>
  );
};

export default RegisterModal;
