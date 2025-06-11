import { useEffect, useReducer, useState } from "react";
import { AuthContext } from "./AuthContext";
import { AuthReducer } from "./AuthReducer";
import { types } from "../types/types";
import { endPoint } from "../../config/config.js";

const init = () => {
  const logged = localStorage.getItem("data-ecommerce");
  if (!logged) {
    return {
      logged: false,
      user: null,
    };
  } else {
    const parsedJSON = JSON.parse(logged);
    return {
      logged: true,
      user: parsedJSON.user,
    };
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, {}, init);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem("data-ecommerce");
    if (logged) {
      const parsedJSON = JSON.parse(logged);
      automaticLogin(parsedJSON);
    } else {
      setLoading(false);
    }
  }, []);

  const automaticLogin = async (parsedJSON) => {
    try {
      const response = await fetch(endPoint.baseURLAuth + "/validar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedJSON.token}`,
        },
      });

      const dataResponse = await response.json();

      if (response.ok) {
        // Ajuste para tu formato de respuesta
        const { token, type, ...userData } = dataResponse;

        const action = {
          type: types.login,
          payload: userData,
        };
        dispatch(action);

        const savedData = {
          token: token,
          user: userData,
        };
        localStorage.setItem("data-ecommerce", JSON.stringify(savedData));
      } else {
        const action = {
          type: types.logout,
        };
        dispatch(action);
        localStorage.removeItem("data-ecommerce");
      }
    } catch (error) {
      console.error("Auto login failed:", error);
      const action = {
        type: types.logout,
      };
      dispatch(action);
      localStorage.removeItem("data-ecommerce");
    }

    setLoading(false);
  };

  const onLogin = (data) => {
    const { token, ...userData } = data;

    const savedData = {
      token: token,
    };

    const action = {
      type: types.login,
      payload: userData,
    };

    localStorage.setItem("data-ecommerce", JSON.stringify(savedData));
    dispatch(action);
  };

  const onLogout = () => {
    localStorage.removeItem("data-ecommerce");
    const action = {
      type: types.logout,
    };
    dispatch(action);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loading,
        login: onLogin,
        logout: onLogout,
        automaticLogin: automaticLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
