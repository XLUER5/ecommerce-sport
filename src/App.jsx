import { useState } from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./auth/context/AuthProvider";
import { CartProvider } from "./auth/context/CartContext";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
