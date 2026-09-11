import { useState, useEffect, useRef } from 'react';
import { createClient } from "@supabase/supabase-js";
import { animate } from 'animejs';
import './App.css';
import Nav from "./navMain.jsx";
import ShirtCatalog from "./shirtCatalog.jsx";
import Shirt from "./shirtCustomScript.jsx";
import Playmat from "./playmatsCustom.jsx";
import MainView from "./mainPage.jsx"; // 🚀 Importamos el nuevo carrusel

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function App() {
  // 🚀 Iniciamos por defecto en la vista "main" (el reel de bienvenida)
  const [currentView, setCurrentView] = useState("main");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [shirtModels, setShirtModels] = useState([]);
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);

  const viewPanelRef = useRef(null);

  useEffect(() => {
    async function fetchInitialCatalog() {
      try {
        const { data, error } = await supabase.from("Shirts").select("*");
        if (!error && data) {
          setShirtModels(data);
          setIsCatalogLoaded(true);
        }
      } catch (err) {
        console.error("Error cargando catálogo global:", err);
      }
    }
    fetchInitialCatalog();
  }, []);

  useEffect(() => {
    if (viewPanelRef.current) {
      animate(viewPanelRef.current, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 500,
        ease: 'outExpo'
      });
    }
  }, [currentView]);

  const handleNavChange = (newView) => {
    if (currentView === newView) return;

    if (viewPanelRef.current) {
      animate(viewPanelRef.current, {
        opacity: [1, 0],
        translateY: [0, 20],
        duration: 200,
        ease: 'inQuad',
        onComplete: () => {
          setSelectedProduct(null);
          setCurrentView(newView);
        }
      });
    } else {
      setSelectedProduct(null);
      setCurrentView(newView);
    }
  };

  return (
    <div className="main-background" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <Nav 
        onGoHome={() => handleNavChange("catalog")}
        onGoMain={() => handleNavChange("main")}
        onGoPlaymats={() => handleNavChange("playmats")}
        onGoContact={() => handleNavChange("contact")}
        onGoOrders={() => handleNavChange("orders")}
      />

      <div 
        ref={viewPanelRef} 
        style={{ 
          flex: 1, 
          width: "100%", 
          display: "flex", 
          flexDirection: "column", 
          opacity: 0,
          position: "relative",
          zIndex: 1 
        }}
      >
        {currentView === "catalog" && (
          <ShirtCatalog 
            shirts={shirtModels} 
            isLoaded={isCatalogLoaded}
            onSelectShirt={(product) => { setSelectedProduct(product); setCurrentView("customizer"); }} 
          />
        )}

        {currentView === "customizer" && (
          <Shirt 
            initialProduct={selectedProduct} 
            onBackToCatalog={() => handleNavChange("catalog")} 
          />
        )}

        {currentView === "main" && (
          // 🚀 Se muestra al iniciar la app y al presionar el botón Main del Nav
          <MainView onGoCatalog={() => handleNavChange("catalog")} />
        )}

        {currentView === "playmats" && (
          <Playmat />
        )}

        {currentView === "contact" && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#fff" }}>
            <h2>Contacto</h2>
            <p>Comunícate con nosotros para cotizaciones de mayoreo y diseños personalizados.</p>
          </div>
        )}

        {currentView === "orders" && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#fff" }}>
            <h2>Seguimiento de Pedidos</h2>
            <p>Ingresa tu número de folio para consultar el estatus de impresión.</p>
          </div>
        )}
      </div>
    </div>
  );
}