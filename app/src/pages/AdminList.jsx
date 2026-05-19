import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getChampions, deleteChampion } from "../api/jsonServer";
import Pagination from "../components/Pagination";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];
const PARTYPES = [
  "Mana", "Energy", "Fury", "Rage", "Flow", "Heat",
  "Ferocity", "Courage", "Grit", "Blood Well", "Shield", "None",
];
const PER_PAGE = 15;

export default function AdminList() {
  const [champions, setChampions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [partype, setPartype] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  const fetchChampions = useCallback(() => {
    setLoading(true);
    getChampions({ name, tag, partype, page, perPage: PER_PAGE })
      .then(({ data, pages, total }) => {
        setChampions(data);
        setTotalPages(pages);
        setTotalItems(total);
      })
      .finally(() => setLoading(false));
  }, [name, tag, partype, page]);

  useEffect(() => {
    fetchChampions();
  }, [fetchChampions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [name, tag, partype]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this champion?")) return;
    await deleteChampion(id);
    fetchChampions();
  };

  return (
    <div className="page">
      <div className="admin-header">
        <h1>Admin — Champions ({totalItems})</h1>
        <Link to="/admin/new">+ New champion</Link>
      </div>

      <div className="filters-bar">
        <input
          placeholder="Filter by name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select value={partype} onChange={(e) => setPartype(e.target.value)}>
          <option value="">All resource types</option>
          {PARTYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading-msg">Loading…</p>
      ) : champions.length === 0 ? (
        <p className="empty-msg">
          No champions found.{" "}
          <Link to="/admin/new">Create the first one!</Link>
        </p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {champions.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.title}</td>
                  <td>{c.tags?.join(", ")}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/edit/${c.id}`}>Edit</Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}