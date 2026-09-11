import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { animate, stagger } from "animejs";
import "./shirtCatalog.css";

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function ShirtCatalog({ onSelectShirt, onClose }) {
  const [shirtModels, setShirtModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const gridRef = useRef(null);
  const hasAnimatedInitial = useRef(false);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const { data, error } = await supabase
          .from("Shirts")
          .select("*");

        if (error) {
          setErrorMessage(`Error al cargar catálogo: ${error.message}`);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setErrorMessage("No hay playeras disponibles en la base de datos.");
          setLoading(false);
          return;
        }

        setShirtModels(data);
        setLoading(false);
      } catch (err) {
        setErrorMessage(`Fallo de conexión: ${err.message}`);
        setLoading(false);
      }
    }

    fetchCatalog();
  }, []);

  // 🚀 Animación inicial (al abrir el catálogo por primera vez)
  useEffect(() => {
    if (!loading && gridRef.current && !hasAnimatedInitial.current) {
      const cards = gridRef.current.querySelectorAll(".catalog-card");
      if (cards.length > 0) {
        hasAnimatedInitial.current = true;
        animate(cards, {
          translateY: [20, 0],
          opacity: [0, 1],
          scale: [0.98, 1],
          duration: 400,
          ease: "outExpo"
        });
      }
    }
  }, [loading, shirtModels]);

  // 🚀 Animación en cascada "lenta" cada vez que se teclea algo en el buscador
  useEffect(() => {
    // Solo actúa si ya pasó la carga inicial y el usuario ha escrito algo
    if (!loading && hasAnimatedInitial.current && searchTerm.trim() !== "") {
      const cards = gridRef.current?.querySelectorAll(".catalog-card");
      if (cards && cards.length > 0) {
        animate(cards, {
          translateY: [25, 0],
          opacity: [0, 1],
          scale: [0.95, 1],
          delay: stagger(60, { start: 30 }), // Retraso escalonado para que aparezcan de forma secuencial y lenta
          duration: 500,
          ease: "outExpo"
        });
      }
    }
  }, [searchTerm, loading]);

  const filteredShirts = shirtModels.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const nameMatch = item.name && item.name.toLowerCase().includes(term);
    const keywordMatch = item.keywords && Array.isArray(item.keywords) && 
      item.keywords.some((kw) => kw && kw.toLowerCase().includes(term));

    return nameMatch || keywordMatch;
  });



  if (errorMessage) {
    return (
      <div className="catalog-modal-overlay">
        <div className="catalog-modal-content">
          <div className="catalog-error">{errorMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-modal-overlay" onClick={onClose}>
      <div className="catalog-modal-content" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        )}

        <header className="catalog-header">
          <h1>Catálogo de Diseños</h1>
          <p>Elige tu diseño favorito para comenzar a personalizarlo</p>

          <div className="catalog-search-wrapper" style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre o etiquetas (ej. anime, carro...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="catalog-search-input"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#18181b",
                color: "#fff",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
        </header>

        <div ref={gridRef} className="catalog-grid">
          {filteredShirts.length > 0 ? (
            filteredShirts.map((item) => (
              <div 
                key={item.id} 
                className="catalog-card" 
                style={{ 
                  opacity: (searchTerm.trim() === "" && hasAnimatedInitial.current) ? 1 : 0 
                }}
              >
                <div className="catalog-image-wrapper">
                  <img src={item.image_url} alt={item.name} className="catalog-img" />
                </div>
                
                <div className="catalog-info">
                  <h3>{item.name}</h3>

                  <button 
                    className="customize-btn"
                    onClick={() => onSelectShirt(item)}
                  >
                    Personalizar 🎨
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#a1a1aa" }}>
              No se encontraron diseños que coincidan con "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}