import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Valentine from "./pages/Valentine";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/i/:token" element={<Valentine />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
