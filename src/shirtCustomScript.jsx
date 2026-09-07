import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import shirtMockUp from "./assets/shirt.png";
import shirtNoise from "./assets/noise.png";
import "./shirtCustomScript.css";

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function ShirtCustom() {
  const [shirtModels, setShirtModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [shirtColor, setShirtColor] = useState("#3b82f6");
  const [errorMessage, setErrorMessage] = useState(null);

  // Lista maestra de colores permitidos en la interfaz
  const colors = [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#18181b" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Red", hex: "#ef4444" },
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
  ];


  useEffect(() => {
    async function fetchShirts() {
      try {
        const { data, error } = await supabase
          .from("Shirts")
          .select("*");

        if (error) {
          console.error("Error de Supabase:", error.message);
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
          // Validamos estrictamente que solo existan los colores que hacen match con tu lista 'colors'
          allowedColors: item.colors
            ? item.colors.map((colorName) => {
                const found = colors.find(
                  (c) => c.name.toLowerCase() === String(colorName).trim().toLowerCase()
                );
                return found ? found.hex : null;
              }).filter(Boolean)
            : []
        }));

        setShirtModels(formatted);
        setSelectedModel(formatted[0]);
        if (formatted[0].allowedColors.length > 0) {
          setShirtColor(formatted[0].allowedColors[0]);
        }
      } catch (err) {
        console.error("Fallo la conexión:", err);
        setErrorMessage(`Fallo de conexión: ${err.message}`);
      }
    }

    fetchShirts();
  }, []);

  useEffect(() => {
    if (selectedModel?.allowedColors && selectedModel.allowedColors.length > 0) {
      if (!selectedModel.allowedColors.includes(shirtColor)) {
        setShirtColor(selectedModel.allowedColors[0]);
      }
    }
  }, [selectedModel]);

  if (errorMessage) {
    return (
      <div className="customizer-container" style={{ color: "#ff4444", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", padding: "20px", textAlign: "center" }}>
        <h3>⚠️ Algo falló al cargar</h3>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!selectedModel) {
    return (
      <div className="customizer-container" style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Cargando diseños desde Supabase...
      </div>
    );
  }

  const isBlackShirt = shirtColor === "#18181b" || shirtColor === "#000000";

  return (
    <div className="customizer-container">
      
      {/* Selector de Color: Estrictamente limitado a los elementos de 'colors' que la playera soporte */}
      <div className="color-selector">
        {colors
          .filter((c) => {
            return (
              !selectedModel.allowedColors ||
              selectedModel.allowedColors.length === 0 ||
              selectedModel.allowedColors.includes(c.hex)
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

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <img
            src={selectedModel.image}
            alt={selectedModel.name}
            style={{ width: "45%", height: "45%", objectFit: "contain" }}
          />
        </div>

        <img src={shirtMockUp} alt="Playera Sombras" className="shirt-shadows" />
      </div>

      <div className="models-scroll-menu">
        {shirtModels.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className={`model-card ${selectedModel.id === model.id ? "active" : ""}`}
          >
            <img src={model.image} alt={model.name} className="model-thumb" />
            <span className="model-name">{model.name}</span>
          </button>
        ))}
      </div>

      <span className="instructions">
        Selecciona un diseño del menú inferior para estampar la playera
      </span>
    </div>
  );
}