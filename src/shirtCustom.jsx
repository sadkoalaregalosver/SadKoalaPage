import { useState } from "react";
import shirtMockUp from "./assets/shirt.png";

export default function ShirtCustomizer() {
  const [shirtColor, setShirtColor] = useState("#3b82f6");
  const [customImage, setCustomImage] = useState(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const colors = [
    { name: "Blanco", hex: "#ffffff" },
    { name: "Negro", hex: "#18181b" },
    { name: "Azul", hex: "#3b82f6" },
    { name: "Rojo", hex: "#ef4444" },
    { name: "Verde", hex: "#22c55e" },
    { name: "Amarillo", hex: "#eab308" },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomImage(URL.createObjectURL(file));
      setPosition({ x: 0, y: 0 });
      setScale(1);
      setRotation(0);
    }
  };

  const handleToggleRotate = () => {
    setRotation((prev) => (prev === 0 ? 90 : 0));
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
    setScale((prev) => {
      const newScale = e.deltaY < 0 ? prev + zoomSpeed : prev - zoomSpeed;
      return Math.min(Math.max(0.4, newScale), 3);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", gap: "15px", padding: "20px", backgroundColor: "#121212", color: "#fff", fontFamily: "sans-serif" }}>
      
      {/* Controles superiores */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 10 }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: "#fff" }} />
        <button
          onClick={handleToggleRotate}
          disabled={!customImage}
          style={{
            padding: "8px 16px",
            backgroundColor: customImage ? "#22c55e" : "#444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: customImage ? "pointer" : "not-allowed",
            fontWeight: "bold"
          }}
        >
          {rotation === 0 ? "Girar a 90° 🔄" : "Restablecer 🔄"}
        </button>
      </div>

      {/* Selector de Color */}
      <div style={{ display: "flex", gap: "10px", zIndex: 10 }}>
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => setShirtColor(c.hex)}
            title={c.name}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: c.hex,
              border: shirtColor === c.hex ? "3px solid #007bff" : "2px solid #555",
              cursor: "pointer",
              transform: shirtColor === c.hex ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.15s ease",
            }}
          />
        ))}
      </div>

      {/* Contenedor principal sin fondo que interfiera */}
      <div style={{
        position: "relative",
        width: "450px",
        height: "550px",
        backgroundColor: "transparent",
      }}>

        {/* CAPA 1: Playera con tinte de color exacto aplicado vía WebkitMask */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: shirtColor,
            WebkitMaskImage: `url(${shirtMockUp})`,
            maskImage: `url(${shirtMockUp})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            zIndex: 1,
          }}
        />

        {/* CAPA 2: Diseño interactivo del usuario */}
        {customImage && (
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <img
              src={customImage}
              alt="Diseño"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* CAPA 3: Sombras, textura y pliegues en Multiply */}
        <img
          src={shirtMockUp}
          alt="Playera Sombras"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            zIndex: 3,
            pointerEvents: "none",
            mixBlendMode: "multiply",
          }}
        />

      </div>

      <span style={{ color: "#aaa", fontSize: "12px" }}>
        Haz clic y arrastra para mover el diseño • Usa la rueda del mouse para redimensionar
      </span>

    </div>
  );
}