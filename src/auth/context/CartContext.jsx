// contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { message } from "antd";
import { AuthContext } from "./AuthContext";
import { endPoint } from "../../config/config";

const CartContext = createContext();

// Acciones del carrito
const CART_ACTIONS = {
  LOAD_CART: "LOAD_CART",
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

// Estado inicial
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

// Reducer para manejar las acciones del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case CART_ACTIONS.LOAD_CART: {
      const items = action.payload || [];
      // Verificar que items sea un array
      if (!Array.isArray(items)) {
        console.warn("Expected items to be an array, received:", items);
        return {
          ...state,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          loading: false,
          error: null,
        };
      }

      const totalItems = items.reduce(
        (sum, item) => sum + (item.cantidad || 0),
        0
      );
      const totalPrice = items.reduce(
        (sum, item) =>
          sum +
          (item.productMonto || item.producto?.monto || 0) *
            (item.cantidad || 0),
        0
      );

      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        loading: false,
        error: null,
      };
    }

    case CART_ACTIONS.ADD_ITEM: {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === newItem.productId
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                cantidad: (item.cantidad || 0) + (newItem.cantidad || 1),
              }
            : item
        );
      } else {
        // Si es nuevo producto, agregarlo
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce(
        (sum, item) => sum + (item.cantidad || 0),
        0
      );
      const totalPrice = newItems.reduce(
        (sum, item) =>
          sum +
          (item.productMonto || item.producto?.monto || 0) *
            (item.cantidad || 0),
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        loading: false,
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.itemId
      );

      const totalItems = newItems.reduce(
        (sum, item) => sum + (item.cantidad || 0),
        0
      );
      const totalPrice = newItems.reduce(
        (sum, item) =>
          sum +
          (item.productMonto || item.producto?.monto || 0) *
            (item.cantidad || 0),
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        loading: false,
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, cantidad } = action.payload;

      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, cantidad } : item
      );

      const totalItems = newItems.reduce(
        (sum, item) => sum + (item.cantidad || 0),
        0
      );
      const totalPrice = newItems.reduce(
        (sum, item) =>
          sum +
          (item.productMonto || item.producto?.monto || 0) *
            (item.cantidad || 0),
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        loading: false,
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        loading: false,
      };

    default:
      return state;
  }
};

// Función para obtener el token
const getAuthToken = () => {
  const token = localStorage.getItem("data-ecommerce");
  if (!token) return null;

  try {
    const parsedToken = JSON.parse(token);
    return parsedToken?.token || null;
  } catch {
    return null;
  }
};

// Provider del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, logged } = useContext(AuthContext);

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en la petición");
    }

    return response.json();
  };

  // Cargar carrito desde la base de datos
  const loadCart = async () => {
    if (!logged || !user?.userId) {
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: [] });
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const data = await authenticatedFetch(`${endPoint.baseURL}/cart`);

      // CORRECCIÓN: Pasar solo los items, no todo el objeto data
      const items = data.items || [];
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: items });
    } catch (error) {
      console.error("Error loading cart:", error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      message.error("Error al cargar el carrito");
    }
  };

  // Agregar producto al carrito
  const addToCart = async (product, quantity = 1) => {
    if (!logged || !user?.userId) {
      message.warning("Debes iniciar sesión para agregar productos al carrito");
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const cartItem = await authenticatedFetch(
        `${endPoint.baseURL}/cart/items`,
        {
          method: "POST",
          body: JSON.stringify({
            productId: product.id,
            cantidad: quantity,
          }),
        }
      );

      // En lugar de actualizar localmente, recargar todo el carrito
      // Esto garantiza que tengas todos los IDs correctos
      await loadCart();

      message.success(`${product.descripcion} agregado al carrito`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      message.error("Error al agregar producto al carrito");
    }
  };

  // Actualizar cantidad de un producto
  const updateQuantity = async (itemId, cantidad) => {
    if (!logged || !user?.userId) {
      message.warning("Debes iniciar sesión");
      return;
    }

    if (cantidad <= 0) {
      await removeFromCart(itemId);
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      await authenticatedFetch(`${endPoint.baseURL}/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({
          cantidad,
        }),
      });

      // Actualizar estado local
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { itemId, cantidad },
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      message.error("Error al actualizar cantidad");
    }
  };

  // Remover producto del carrito
  const removeFromCart = async (itemId) => {
    if (!logged || !user?.userId) {
      message.warning("Debes iniciar sesión");
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      await authenticatedFetch(`${endPoint.baseURL}/cart/items/${itemId}`, {
        method: "DELETE",
        body: JSON.stringify({ itemId }),
      });

      // Actualizar estado local
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { itemId },
      });

      message.info("Producto removido del carrito");
    } catch (error) {
      console.error("Error removing from cart:", error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      message.error("Error al remover producto");
    }
  };

  // Limpiar carrito
  const clearCart = async () => {
    if (!logged || !user?.userId) {
      message.warning("Debes iniciar sesión");
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      await authenticatedFetch(`${endPoint.baseURL}/cart`, {
        method: "DELETE",
      });

      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      message.info("Carrito limpiado");
    } catch (error) {
      console.error("Error clearing cart:", error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      message.error("Error al limpiar carrito");
    }
  };

  // Obtener item específico del carrito
  const getCartItem = (productoId) => {
    return state.items.find((item) => item.productId === productoId);
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productoId) => {
    return state.items.some((item) => item.productId === productoId);
  };

  // Cargar carrito cuando el usuario inicie sesión
  useEffect(() => {
    if (logged && user?.userId) {
      loadCart();
    } else {
      // Si no está logueado, limpiar carrito
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [logged, user?.userId]);

  const value = {
    // Estado
    cart: state,
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    loading: state.loading,
    error: state.error,

    // Funciones
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }

  return context;
};

export default CartContext;
