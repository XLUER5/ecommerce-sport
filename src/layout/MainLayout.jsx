import React, { useContext, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Input,
  Typography,
  theme,
  Drawer,
  Grid,
  Row,
  Col,
  message,
} from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  LoginOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  HeartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import { AuthContext } from "../auth/context/AuthContext";
import { useCart } from "../auth/context/CartContext";
import CartDrawer from "../components/cart/CartDrawer";
import { endPoint } from "../config/config";
import { useNavigate } from "react-router";

const { Header, Content } = Layout;
const { Search } = Input;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const MainLayout = ({ children }) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  const { user, logged, login, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
  const navigate = useNavigate(); // Hook para navegación

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLogin = async (values) => {
    try {
      const response = await fetch(`${endPoint.baseURLAuth}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el login");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      if (login) {
        login(data);
      }

      setLoginModalVisible(false);
      message.success("¡Bienvenido!");
    } catch (error) {
      message.error(error.message || "Error al iniciar sesión");
      throw error;
    }
  };

  const handleRegister = async (values) => {
    try {
      const response = await fetch(`${endPoint.baseURLAuth}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el registro");
      }

      const data = await response.json();

      setRegisterModalVisible(false);
      message.success(
        "¡Cuenta creada exitosamente! Ahora puedes iniciar sesión."
      );

      setTimeout(() => {
        setLoginModalVisible(true);
      }, 500);
    } catch (error) {
      message.error(error.message || "Error al crear la cuenta");
      throw error; 
    }
  };

  // Función para manejar logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      if (logout) {
        logout();
      }
      message.success("Sesión cerrada correctamente");
    } catch (error) {
      message.error("Error al cerrar sesión");
    }
  };

  // Función para navegar al perfil
  const handleNavigateToProfile = () => {
    navigate("/perfil");
  };

  const handleNavigateToHome = () => {
    navigate("/");
  };

  const handleNavigateOrden = () => {
    navigate("/orden");
  };

  // Funciones para manejar los modales
  const handleShowLogin = () => {
    setRegisterModalVisible(false);
    setLoginModalVisible(true);
  };

  const handleCancelLogin = () => {
    setLoginModalVisible(false);
  };

  const handleShowRegister = () => {
    setLoginModalVisible(false);
    setRegisterModalVisible(true);
  };

  const handleCancelRegister = () => {
    setRegisterModalVisible(false);
  };

  // Funciones del carrito
  const handleOpenCart = () => {
    setCartDrawerVisible(true);
  };

  const handleCloseCart = () => {
    setCartDrawerVisible(false);
  };

  // Menú items para desktop
  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Inicio",
      onClick: handleNavigateToHome,
    },
    !logged && {
      key: "login",
      icon: <LoginOutlined />,
      onClick: handleShowLogin,
      label: "Login",
    },
    logged && {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Mis Órdenes",
      onClick: handleNavigateOrden
    },
    logged && {
      key: "profile",
      icon: <UserOutlined />,
      label: "Perfil",
      onClick: handleNavigateToProfile,
    },
  ].filter(Boolean);

  // Dropdown del perfil
  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: handleNavigateToProfile,
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Mis Órdenes",
      onClick: handleNavigateOrden
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header Principal */}
      <Header
        style={{
          background: "#ffffff",
          padding: 0,
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <Row align="middle" justify="space-between">
            {/* Logo */}
            <Col flex="none">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {!isMobile && (
                  <Text
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ShopHub
                  </Text>
                )}
              </div>
            </Col>

            {/* Navegación Desktop */}
            {!isMobile && (
              <Col
                flex="auto"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Space size="large" align="center">
                  <Space size="medium">
                    <Button
                      type="text"
                      icon={<HomeOutlined />}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        height: "auto",
                        padding: "8px 12px",
                      }}
                      onClick={handleNavigateToHome}
                    >
                      Inicio
                    </Button>

                    {!logged && (
                      <Button
                        type="text"
                        icon={<LoginOutlined />}
                        onClick={handleShowLogin}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "14px",
                          fontWeight: "500",
                          height: "auto",
                          padding: "8px 12px",
                        }}
                      >
                        Login
                      </Button>
                    )}

                    {logged && (
                      <>
                        <Button
                          type="text"
                          icon={<ShoppingOutlined />}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            height: "auto",
                            padding: "8px 12px",
                          }}
                          onClick={handleNavigateOrden}
                        >
                          Mis Órdenes
                        </Button>
                      </>
                    )}
                  </Space>
                </Space>
              </Col>
            )}

            {/* Carrito y Perfil */}
            {!isMobile && (
              <Col flex="none">
                <Space size="middle">
                  {/* Carrito */}
                  <Badge count={totalItems} size="small" offset={[0, 0]}>
                    <Button
                      type="text"
                      icon={<ShoppingCartOutlined />}
                      size="large"
                      onClick={handleOpenCart}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                      }}
                    />
                  </Badge>

                  {/* Perfil */}
                  {logged ? (
                    <Dropdown
                      menu={{ items: profileMenuItems }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <div
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <Avatar
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "2px solid #e5e7eb",
                          }}
                          icon={<UserOutlined />}
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: 1.2,
                              cursor: "pointer",
                            }}
                          >
                            {user?.nombreUsuario +
                              " " +
                              user?.apellidoUsuario || "Mi Cuenta"}
                          </Text>
                        </div>
                      </div>
                    </Dropdown>
                  ) : (
                    <div
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        transition: "background-color 0.2s",
                      }}
                      onClick={handleShowLogin}
                    >
                      <Avatar
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "2px solid #e5e7eb",
                        }}
                        icon={<UserOutlined />}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            lineHeight: 1.2,
                            cursor: "pointer",
                          }}
                        >
                          Mi Cuenta
                        </Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Col>
            )}

            {/* Navegación Mobile */}
            {isMobile && (
              <Col flex="none">
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<SearchOutlined />}
                    size="large"
                    style={{ borderRadius: "8px" }}
                  />

                  <Badge count={totalItems} size="small">
                    <Button
                      type="text"
                      icon={<ShoppingCartOutlined />}
                      size="large"
                      onClick={handleOpenCart}
                      style={{ borderRadius: "8px" }}
                    />
                  </Badge>

                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    size="large"
                    onClick={() => setMobileMenuVisible(true)}
                    style={{ borderRadius: "8px" }}
                  />
                </Space>
              </Col>
            )}
          </Row>
        </div>
      </Header>

      {/* Drawer Mobile */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🛒
            </div>
            <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
              ShopHub
            </Text>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={300}
        styles={{
          body: { padding: 0 },
        }}
      >
        <div style={{ padding: "24px 0" }}>
          {/* Perfil en drawer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0 24px 24px 24px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <Avatar
              size="large"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              icon={<UserOutlined />}
            />
            <div>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  display: "block",
                }}
              >
                {logged ? user?.nombreUsuario || "Mi Cuenta" : "Invitado"}
              </Text>
            </div>
          </div>

          {/* Menú mobile */}
          <Menu
            mode="vertical"
            items={[
              ...menuItems.map((item) => ({
                ...item,
                onClick:
                  item.key === "login"
                    ? handleShowLogin
                    : item.key === "profile"
                    ? handleNavigateToProfile
                    : item.onClick,
              })),
              {
                key: "cart",
                icon: <ShoppingCartOutlined />,
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Carrito</span>
                    <Badge count={totalItems} size="small" />
                  </div>
                ),
                onClick: handleOpenCart,
              },
              logged && {
                type: "divider",
              },
              logged && {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Cerrar Sesión",
                danger: true,
                onClick: handleLogout,
              },
            ].filter(Boolean)}
            style={{
              border: "none",
              fontSize: "16px",
            }}
          />
        </div>
      </Drawer>

      {/* Contenido Principal */}
      <Content
        style={{
          background: "#f8fafc",
          minHeight: "calc(100vh - 64px)",
          padding: isMobile ? "0" : "24px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: isMobile ? "16px" : "0 16px",
            background: colorBgContainer,
            borderRadius: isMobile ? "0" : "12px",
            minHeight: isMobile ? "calc(100vh - 80px)" : "calc(100vh - 112px)",
            boxShadow: isMobile
              ? "none"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
        >
          {children}
        </div>
      </Content>

      {/* Modales */}
      <LoginModal
        visible={loginModalVisible}
        onCancel={handleCancelLogin}
        onLogin={handleLogin}
        onShowRegister={handleShowRegister}
      />

      <RegisterModal
        visible={registerModalVisible}
        onCancel={handleCancelRegister}
        onRegister={handleRegister}
        onShowLogin={handleShowLogin}
      />

      {/* Cart Drawer */}
      <CartDrawer visible={cartDrawerVisible} onClose={handleCloseCart} />
    </Layout>
  );
};

export default MainLayout;
