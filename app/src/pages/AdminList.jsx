import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getChampions, deleteChampion } from "../api/jsonServer";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];
const PARTYPES = ["Mana", "Energy", "Fury", "Rage", "Flow", "Heat", "Ferocity", "Courage", "Grit", "Blood Well", "Shield", "None"];

export default function AdminList() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", tag: "", partype: "" });

  const fetchChampions = () => {
    setLoading(true);
    getChampions(filters)
      .then(setChampions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChampions();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this champion?")) return;
    await deleteChampion(id);
    fetchChampions();
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin — Champions ({champions.length})</h1>
        <Link to="/admin/new">+ New champion</Link>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Filter by name..."
          value={filters.name}
          onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
        />
        <select
          value={filters.tag}
          onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
        >

          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={filters.partype}
          onChange={(e) => setFilters((f) => ({ ...f, partype: e.target.value }))}
        >
          <option value="">All resource types</option>
          {PARTYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : champions.length === 0 ? (
        <p>No champions found. <Link to="/admin/new">Create the first one!</Link></p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ textAlign: "left" }}>
            <tr>
              <th style={{  padding: "8px", borderBottom: "1px solid var(--border)" }}>Name</th>
              <th style={{  padding: "8px", borderBottom: "1px solid var(--border)" }}>Title</th>
              <th style={{  padding: "8px", borderBottom: "1px solid var(--border)" }}>Roles</th>
              <th style={{  padding: "8px", borderBottom: "1px solid var(--border)" }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "left" }}>
            {champions.map((c) => (
              <tr key={c.id}>
                <td style={{ padding: "8px" }}>{c.name}</td>
                <td style={{ padding: "8px" }}>{c.title}</td>
                <td style={{ padding: "8px" }}>{c.tags?.join(", ")}</td>
                <td style={{ padding: "8px", display: "flex", gap: "8px" }}>
                  <Link to={`/admin/edit/${c.id}`}>Edit</Link>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}