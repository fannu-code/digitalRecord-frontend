import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SubmitRecord from "./pages/SubmitRecord";
import SearchRecord from "./pages/SearchRecord";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit-record"
          element={
            <ProtectedRoute>
              <SubmitRecord />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search-record"
          element={
            <ProtectedRoute>
              <SearchRecord />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
