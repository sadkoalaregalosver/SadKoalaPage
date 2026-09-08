import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import shirtMockUp from "./assets/shirt.png";
import shirtNoise from "./assets/noise.png";
import "./shirtCustomScript.css";

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function ShirtCustom({ initialProduct, onBackToCatalog }) {
  const [shirtModels, setShirtModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(initialProduct || null);
  const [shirtColor, setShirtColor] = useState("#3b82f6");
  const [errorMessage, setErrorMessage] = useState(null);

  // Referencia y estados para controlar el arrastre del scroll con el mouse
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const colors = [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#18181b" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Red", hex: "#ef4444" },
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
  ];

  const formatColors = (itemColors) => {
    return itemColors
      ? itemColors.map((colorName) => {
          const found = colors.find(
            (c) => c.name.toLowerCase() === String(colorName).trim().toLowerCase()
          );
          return found ? found.hex : null;
        }).filter(Boolean)
      : [];
  };

  useEffect(() => {
    async function fetchShirts() {
      try {
        const { data, error } = await supabase
          .from("Shirts")
          .select("*");

        if (error) {
          setErrorMessage(`Error de Supabase: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          setErrorMessage("La tabla 'Shirts' está vacía o no devolvió registros.");
          return;
        }

        const formatted = data.map((item) => ({
          id: item.id,
          name: item.name || "Sin nombre",
          image: item.image_url,
          allowedColors: formatColors(item.colors),
          height: item.height
        }));

        setShirtModels(formatted);

        if (!selectedModel && formatted.length > 0) {
          setSelectedModel(formatted[0]);
        } else if (initialProduct) {
          const matched = formatted.find(m => m.id === initialProduct.id);
          if (matched) setSelectedModel(matched);
        }
      } catch (err) {
        setErrorMessage(`Fallo de conexión: ${err.message}`);
      }
    }

    fetchShirts();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      const currentAllowed = selectedModel.allowedColors || formatColors(selectedModel.colors);
      if (currentAllowed && currentAllowed.length > 0) {
        if (!currentAllowed.includes(shirtColor)) {
          setShirtColor(currentAllowed[0]);
        }
      }
    }
  }, [selectedModel]);

  // Funciones para manejar el arrastre (Drag to Scroll)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (errorMessage) {
    return (
      <div className="customizer-container">
        <h3>⚠️ Algo falló al cargar</h3>
        <p>{errorMessage}</p>
        {onBackToCatalog && (
          <button onClick={onBackToCatalog}>
            ← Volver al Catálogo
          </button>
        )}
      </div>
    );
  }

  if (!selectedModel) {
    return (
      <div className="customizer-container">
        Cargando diseños desde Supabase...
      </div>
    );
  }

  const currentAllowedColors = selectedModel.allowedColors || formatColors(selectedModel.colors);
  const isBlackShirt = shirtColor === "#18181b" || shirtColor === "#000000";

  return (
    <div className="customizer-container">
      <div className="shirt-stage">
        <div
          className="shirt-base-color"
          style={{
            backgroundColor: shirtColor,
            WebkitMaskImage: `url(${shirtMockUp})`,
            maskImage: `url(${shirtMockUp})`,
          }}
        />

        <div
          className="shirt-noise-layer"
          style={{
            backgroundImage: `url(${shirtNoise})`,
            backgroundSize: isBlackShirt ? "300px 300px" : "150px 150px",
            WebkitMaskImage: `url(${shirtMockUp})`,
            maskImage: `url(${shirtMockUp})`,
          }}
        />

        <div className="shirt-design-stage-3d">
          <img
            src={selectedModel.image || selectedModel.image_url}
            alt={selectedModel.name}
            className="shirt-design-img-3d"
            style={{
              transform: `rotateY(-35deg) rotateX(0deg) scale(1) translateY(${selectedModel.height ?? 0}px) translateX(-20px)`
            }}
          />
        </div>

        <img src={shirtMockUp} alt="Playera Sombras" className="shirt-shadows" />
      </div>

      {/* Selector de colores centrado debajo de la playera */}
      <div className="color-selector">
        {colors
          .filter((c) => {
            return (
              !currentAllowedColors ||
              currentAllowedColors.length === 0 ||
              currentAllowedColors.includes(c.hex)
            );
          })
          .map((c) => (
            <button
              key={c.hex}
              onClick={() => setShirtColor(c.hex)}
              title={c.name}
              className={`color-btn ${shirtColor === c.hex ? "selected" : ""}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
      </div>

      {/* Menú de modelos con soporte de arrastre */}
      <div 
        className="models-scroll-menu"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
      >
        {shirtModels.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className={`model-card ${selectedModel.id === model.id ? "active" : ""}`}
          >
            <img 
              src={model.image} 
              alt={model.name} 
              className="model-thumb" 
              draggable="false"
            />
          </button>
        ))}
      </div>

      {onBackToCatalog && (
        <div className="catalog-back-wrapper">
          <button 
            onClick={onBackToCatalog}
            className="back-catalog-btn"
          >
            ← Regresar al Catálogo
          </button>
        </div>
      )}
    </div>
  );
}