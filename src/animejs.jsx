import { useState, useEffect, useRef } from "react";
import anime from "animejs";

// Componente animado con control booleano inicializado en false
function MiComponenteAnimado({ isActive }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!boxRef.current) return;

    if (isActive) {
      anime({
        targets: boxRef.current,
        translateY: [-20, 0],
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 800,
        easing: "easeOutExpo"
      });
    } else {
      anime({
        targets: boxRef.current,
        translateY: [0, -20],
        opacity: [1, 0],
        scale: [1, 0.95],
        duration: 400,
        easing: "easeInExpo"
      });
    }
  }, [isActive]);

  return (
    <div 
      ref={boxRef} 
      style={{ 
        padding: "2rem", 
        background: "#18181b", 
        borderRadius: "12px",
        border: "1px solid #3f3f46",
        color: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        marginTop: "1rem"
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0" }}>¡Efecto controlado por booleano!</h2>
      <p style={{ margin: 0 }}>Estado actual (isActive): <strong>{isActive ? "TRUE 🟢" : "FALSE 🔴"}</strong></p>
    </div>
  );
}

// Vista principal con el estado booleano configurado en false por defecto
export default function TestView() {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "500px", margin: "0 auto" }}>
      <button 
        onClick={() => setMostrar(!mostrar)}
        style={{ 
          padding: "0.75rem 1.5rem", 
          cursor: "pointer", 
          background: "#3b82f6", 
          color: "#fff", 
          border: "none", 
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "1rem"
        }}
      >
        Alternar Animación (isActive: {String(mostrar)})
      </button>

      <MiComponenteAnimado isActive={mostrar} />
    </div>
  );
}