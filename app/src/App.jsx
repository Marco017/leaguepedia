import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ChampionList from "./pages/ChampionList";
import ChampionDetail from "./pages/ChampionDetail";
import AdminList from "./pages/AdminList";
import ChampionForm from "./pages/ChampionForm";

function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/">Champions</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ChampionList />} />
        <Route path="/champion/:id" element={<ChampionDetail />} />
        <Route path="/admin" element={<AdminList />} />
        <Route path="/admin/new" element={<ChampionForm />} />
        <Route path="/admin/edit/:id" element={<ChampionForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;