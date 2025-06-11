import React from "react";
import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import PrivatesRoutes from "../auth/PrivatesRoutes";
import Cart from "../pages/Cart";
import Ordenes from "../pages/Ordenes";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/perfil"
        element={
          <PrivatesRoutes>
            <Profile />
          </PrivatesRoutes>
        }
      />
      <Route
        path="/carrito"
        element={
          <PrivatesRoutes>
            <Cart />
          </PrivatesRoutes>
        }
      />
      <Route
        path="/orden"
        element={
          <PrivatesRoutes>
            <Ordenes />
          </PrivatesRoutes>
        }
      />
    </Routes>
  );
};

export default AppRouter;
