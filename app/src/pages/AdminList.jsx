import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getChampions, deleteChampion } from "../api/jsonServer";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];

export default function AdminList() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", tag: "" });

  const fetchChampions = () => {
    setLoading(true);
    getChampions(filters)
      .then(setChampions)
      .finally(() => setLoading(false));
  };

  // Re-fetch sempre que os filtros mudam
  useEffect(() => {
    fetchChampions();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!confirm("Tens a certeza que queres eliminar este champion?")) return;
    await deleteChampion(id);
    fetchChampions();
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin — Champions ({champions.length})</h1>
        <Link to="/admin/new">+ Novo champion</Link>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Filtrar por nome..."
          value={filters.name}
          onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
        />
        <select
          value={filters.tag}
          onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
        >
          <option value="">Todas as roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : champions.length === 0 ? (
        <p>Nenhum champion encontrado. <Link to="/admin/new">Cria o primeiro!</Link></p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border)" }}>Nome</th>
              <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border)" }}>Título</th>
              <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border)" }}>Roles</th>
              <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border)" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {champions.map((c) => (
              <tr key={c.id}>
                <td style={{ padding: "8px" }}>{c.name}</td>
                <td style={{ padding: "8px" }}>{c.title}</td>
                <td style={{ padding: "8px" }}>{c.tags?.join(", ")}</td>
                <td style={{ padding: "8px", display: "flex", gap: "8px" }}>
                  <Link to={`/admin/edit/${c.id}`}>Editar</Link>
                  <button onClick={() => handleDelete(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}