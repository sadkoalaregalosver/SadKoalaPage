import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./shirtCatalog.css";

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function ShirtCatalog({ onSelectShirt, onClose }) {
  const [shirtModels, setShirtModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // 🚀 Lógica de filtrado por nombre y array de keywords de Supabase
  const filteredShirts = shirtModels.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Buscar coincidencia en el nombre
    const nameMatch = item.name && item.name.toLowerCase().includes(term);

    // Buscar coincidencia dentro del arreglo de keywords (`text[]`)
    const keywordMatch = item.keywords && Array.isArray(item.keywords) && 
      item.keywords.some((kw) => kw && kw.toLowerCase().includes(term));

    return nameMatch || keywordMatch;
  });

  if (loading) {
    return (
      <div className="catalog-modal-overlay">
        <div className="catalog-modal-content">
          <div className="catalog-loading">Cargando catálogo de playeras...</div>
        </div>
      </div>
    );
  }

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

          {/* 🚀 Barra de Búsqueda Interactiva */}
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

        <div className="catalog-grid">
          {filteredShirts.length > 0 ? (
            filteredShirts.map((item) => (
              <div key={item.id} className="catalog-card">
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