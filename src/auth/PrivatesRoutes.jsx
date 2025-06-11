import { memo, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router";

const PrivatesRoutesComponent = ({ children }) => {
  const { logged } = useContext(AuthContext);
  return logged ? children : <Navigate to="/" />;
};

const PrivatesRoutes = memo(PrivatesRoutesComponent);

export default PrivatesRoutes;
