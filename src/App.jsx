import { useState } from 'react';
import './App.css';
import Playmat from "./playmatsCustom.jsx";
import ShirtCatalog from "./shirtCatalog.jsx";
import Shirt from "./shirtCustomScript.jsx";

export default function App() {
  // 1. Empezamos con la vista activa en "catalog" para que sea lo primero que se vea
  const [currentView, setCurrentView] = useState("catalog"); // "catalog" o "customizer"
  
  // 2. Guardamos la playera/diseño que el usuario seleccionó
  const [selectedProduct, setSelectedProduct] = useState(null);

  const PlaymatOn = false;

  // Cuando hacen clic en "Personalizar 🎨" en el catálogo
  const handleSelectShirt = (product) => {
    setSelectedProduct(product);
    setCurrentView("customizer"); // Cambia la pantalla al personalizador
  };

  // Por si quieres poner un botón dentro del personalizador para volver al catálogo
  const handleBackToCatalog = () => {
    setSelectedProduct(null);
    setCurrentView("catalog");
  };

  return (
    <div className="main-background">
      {PlaymatOn && <Playmat />}

      {/* Si la vista actual es "catalog", mostramos el catálogo */}
      {currentView === "catalog" && (
        <ShirtCatalog onSelectShirt={handleSelectShirt} />
      )}

      {/* Si la vista actual es "customizer", mostramos la pantalla de personalización */}
      {currentView === "customizer" && (
        <Shirt 
          initialProduct={selectedProduct} 
          onBackToCatalog={handleBackToCatalog} 
        />
      )}
    </div>
  );
}