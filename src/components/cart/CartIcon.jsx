import React, { useState } from "react";
import { Badge, Button, Tooltip } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useCart } from "../../auth/context/CartContext";
import CartDrawer from "./CartDrawer";

const CartIcon = ({ style = {} }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { totalItems, totalPrice } = useCart();

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <>
      <Tooltip
        title={
          totalItems > 0
            ? `${totalItems} productos - Q.${totalPrice.toFixed(2)}`
            : "Carrito vacío"
        }
        placement="bottom"
      >
        <Badge
          count={totalItems}
          size="small"
          style={{
            backgroundColor: "#ff4d4f",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "11px",
            minWidth: "18px",
            height: "18px",
            lineHeight: "18px",
            borderRadius: "9px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          offset={[-2, 2]}
        >
          <Button
            type="text"
            icon={
              <ShoppingCartOutlined
                style={{
                  fontSize: "20px",
                  color: totalItems > 0 ? "#1890ff" : "#666666",
                  transition: "color 0.3s ease",
                }}
              />
            }
            onClick={showDrawer}
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
              padding: "4px 8px",
              height: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              ...style,
            }}
            className="cart-icon-button"
          />
        </Badge>
      </Tooltip>

      <CartDrawer visible={drawerVisible} onClose={closeDrawer} />

      <style jsx>{`
        .cart-icon-button:hover {
          background-color: rgba(24, 144, 255, 0.1) !important;
          border-radius: 6px;
        }
      `}</style>
    </>
  );
};

export default CartIcon;
