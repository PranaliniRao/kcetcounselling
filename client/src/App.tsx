import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import CollegeDetailsPage from "./pages/CollegeDetailsPage";
import ComparisonPage from "./pages/ComparisonPage";
import SavedPage from "./pages/SavedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/college/:collegeCode" element={<CollegeDetailsPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;