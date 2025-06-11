import { createContext, useContext, useState, useEffect } from "react";
import { endPoint } from "../../config/config";
import { AuthContext } from "../../auth/context/AuthContext";
import { getIconComponent } from "../../helpers/iconUtils";

export const MenuContext = createContext();

export const useMenuContext = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
  const { user, logged } = useContext(AuthContext);

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const secciones = {
    Catalogos: {
      title: "Catálogos",
      icon: "BookOutlined",
      key: "catalogos",
    },
    Gestiones: {
      title: "Gestiones",
      icon: "SettingOutlined",
      key: "gestiones",
    },
    Reportes: {
      title: "Reportes",
      icon: "FileTextOutlined",
      key: "reportes",
    },
    Configuraciones: {
      title: "Configuraciones",
      icon: "ControlOutlined",
      key: "configuraciones",
    },
  };

  const organizarMenuPorSecciones = (items) => {
    const menuOrganizado = [];
    const itemsSinPadre = [];

    const seccionesConItems = {};

    items.forEach((item) => {
      const itemProcesado = {
        key: item.path,
        label: item.title,
        icon: getIconComponent(item.icon),
        path: item.path,
      };

      if (item.padre && secciones[item.padre]) {
        if (!seccionesConItems[item.padre]) {
          seccionesConItems[item.padre] = [];
        }
        seccionesConItems[item.padre].push(itemProcesado);
      } else {
        itemsSinPadre.push(itemProcesado);
      }
    });

    menuOrganizado.push(...itemsSinPadre);

    Object.keys(secciones).forEach((seccionKey) => {
      if (
        seccionesConItems[seccionKey] &&
        seccionesConItems[seccionKey].length > 0
      ) {
        const seccion = secciones[seccionKey];

        if (menuOrganizado.length > 0) {
          menuOrganizado.push({
            type: "divider",
            key: `divider-${seccion.key}`,
          });
        }

        menuOrganizado.push({
          type: "group",
          label: seccion.title,
          key: `group-${seccion.key}`,
        });

        menuOrganizado.push(...seccionesConItems[seccionKey]);
      }
    });

    return menuOrganizado;
  };

  const fetchMenuItems = async () => {
    if (!logged || !user?.token) {
      setMenuItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endPoint.baseURL + "/menu/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Estructura de respuesta inválida");
      }

      const menuOrganizado = organizarMenuPorSecciones(result.data);

      setMenuItems(menuOrganizado);
    } catch (error) {
      setError(error.message);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (logged) {
      fetchMenuItems();
    } else {
      setMenuItems([]);
    }
  }, [logged, user?.token]);

  return (
    <MenuContext.Provider
      value={{ menuItems, loading, error, refetchMenu: fetchMenuItems }}
    >
      {children}
    </MenuContext.Provider>
  );
};
