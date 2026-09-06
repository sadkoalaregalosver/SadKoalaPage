import { useState } from "react";
import playmat1 from "./assets/playmat1.png";
import playmat2 from "./assets/playmat2.png";
import playmat3 from "./assets/playmat3.png";

export default function Playmat() {
  const [currentBg, setCurrentBg] = useState(playmat1);
  const [customImage, setCustomImage] = useState(null);
  
  // Posición inicial centrada, escala 1x y rotación en 0°
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1); 
  const [rotation, setRotation] = useState(0); // Solo tomará valores 0 o 90
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomImage(URL.createObjectURL(file));
      setPosition({ x: 0, y: 0 });
      setScale(1);
      setRotation(0);
    }
  };

  // Alterna únicamente entre 0 y 90 grados
  const handleToggleRotate = () => {
    setRotation((prevRotation) => (prevRotation === 0 ? 90 : 0));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.08;
    setScale((prevScale) => {
      const newScale = e.deltaY < 0 ? prevScale + zoomSpeed : prevScale - zoomSpeed;
      return Math.min(Math.max(0.5, newScale), 4);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", userSelect: "none", gap: "15px" }}>
      {/* Selector de archivo e interfaz de control */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 10 }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          style={{ color: "#fff" }}
        />
        <button
          onClick={handleToggleRotate}
          disabled={!customImage}
          style={{
            padding: "8px 16px",
            backgroundColor: customImage ? "#28a745" : "#555",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: customImage ? "pointer" : "not-allowed",
            fontWeight: "bold"
          }}
        >
          {rotation === 0 ? "Girar a 90° 🔄" : "Volver a Horizontal 🔄"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", zIndex: 10 }}>
        <button 
          onClick={() => setCurrentBg(playmat1)}
          style={{
            padding: "8px 16px",
            backgroundColor: currentBg === playmat1 ? "#007bff" : "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Playmat 1
        </button>
        <button 
          onClick={() => setCurrentBg(playmat2)}
          style={{
            padding: "8px 16px",
            backgroundColor: currentBg === playmat2 ? "#007bff" : "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Playmat 2
        </button>
        <button 
          onClick={() => setCurrentBg(playmat3)}
          style={{
            padding: "8px 16px",
            backgroundColor: currentBg === playmat3 ? "#007bff" : "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Playmat 3
        </button>
      </div>

      <div style={{ 
        position: "relative", 
        width: "600px", 
        height: "350px", 
        backgroundColor: "#111", 
        borderRadius: "26px", 
        overflow: "hidden" 
      }}>
        
        {/* 1. Capa de la imagen del usuario */}
        {customImage && (
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <img
              src={customImage}
              alt="Diseño personalizado"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* 2. Capa superior de la base del Playmat */}
 <img
  src={currentBg}
  alt="Playmat Base"
  style={{
    position: "absolute",
    top: -4,
    left: 0,
    width: "102%",
    height: "103%",
    objectFit: "fill",
    zIndex: 2,
    pointerEvents: "none",
    mixBlendMode: customImage ? "multiply" : "normal", // Alterna entre multiply y normal
  }}
/>

      </div>
    </div>
  );
}