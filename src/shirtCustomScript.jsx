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

  // Estado para las 4 opciones del menú inferior
  const [recommendedModels, setRecommendedModels] = useState([]);
  
  // Bandera para fijar las recomendaciones solo la primera vez que se abre la vista
  const hasInitializedRecommendations = useRef(false);

  // Referencia y estados para el arrastre del scroll con el mouse
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

  // Función robusta para parsear 'keys' sin importar si viene como array, string plano o JSON de Supabase
  const parseKeys = (rawKeys) => {
    if (!rawKeys) return [];
    if (Array.isArray(rawKeys)) return rawKeys;
    if (typeof rawKeys === "string") {
      try {
        const parsed = JSON.parse(rawKeys);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return rawKeys.replace(/[{}]/g, "").split(",").map((k) => k.trim());
      }
    }
    return [];
  };

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
          colors: item.colors,
          keys: parseKeys(item.keys), // 👈 Usamos el parseador seguro aquí
          allowedColors: formatColors(item.colors),
          height: item.height
        }));

        setShirtModels(formatted);

        const targetProduct = initialProduct || formatted[0];
        if (targetProduct) {
          const matched = formatted.find(m => m.id === targetProduct.id) || targetProduct;
          setSelectedModel(matched);
        }
      } catch (err) {
        setErrorMessage(`Fallo de conexión: ${err.message}`);
      }
    }

    fetchShirts();
  }, []);

  // Genera las 4 recomendaciones una sola vez usando 'keys' (prioriza por coincidencia y rellena al azar)
  useEffect(() => {
    if (!selectedModel || shirtModels.length === 0 || hasInitializedRecommendations.current) return;

    const baseProduct = initialProduct || selectedModel;
    const others = shirtModels.filter((m) => m.id !== baseProduct.id);
    const baseKeys = parseKeys(baseProduct.keys);

    // Filtra las que comparten al menos una clave en el arreglo 'keys' (comparación insensible a mayúsculas/minúsculas)
    const matchedByKeys = others.filter((m) => {
      const mKeys = parseKeys(m.keys);
      if (mKeys.length === 0) return false;
      return mKeys.some((k) => 
        baseKeys.some((bk) => String(bk).trim().toLowerCase() === String(k).trim().toLowerCase())
      );
    });

    // Si no hay suficientes por coincidencia, el resto se completa de forma totalmente al azar
    const remaining = others.filter((m) => !matchedByKeys.includes(m));
    const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());

    const combined = [...matchedByKeys, ...shuffledRemaining];
    
    setRecommendedModels(combined.slice(0, 4));
    hasInitializedRecommendations.current = true;
  }, [shirtModels, initialProduct, selectedModel]);

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

      <div 
        className="models-scroll-menu"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
      >
        {recommendedModels.map((model) => (
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