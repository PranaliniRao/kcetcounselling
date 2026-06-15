// src/pages/ComparisonPage.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { CATEGORY_OPTIONS } from "../constants/categories";

interface CollegeItem {
  collegeCode: string;
  collegeName: string;
}

interface CutoffRecord {
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  round: string;
  cutoff: string;
}

interface CollegeData {
  collegeCode: string;
  collegeName: string;
  records: CutoffRecord[];
}

export default function ComparisonPage() {
  const [collegesList, setCollegesList] = useState<CollegeItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected parameters
  const [collegeCodeA, setCollegeCodeA] = useState("");
  const [collegeCodeB, setCollegeCodeB] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("GM");

  // Loaded data
  const [dataA, setDataA] = useState<CollegeData | null>(null);
  const [dataB, setDataB] = useState<CollegeData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  // Fetch colleges dropdown list
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/colleges`);
        const sorted = response.data.sort((a: CollegeItem, b: CollegeItem) =>
          a.collegeName.localeCompare(b.collegeName)
        );
        setCollegesList(sorted);
    
        // Default selection: RVCE (E005) vs BMSCE (E006) if they exist
        const defaultA = sorted.find((c: CollegeItem) => c.collegeCode === "E005") || sorted[0];
        const defaultB = sorted.find((c: CollegeItem) => c.collegeCode === "E006") || sorted[1] || sorted[0];
        
        if (defaultA) setCollegeCodeA(defaultA.collegeCode);
        if (defaultB) setCollegeCodeB(defaultB.collegeCode);
      } catch (err) {
        console.error("Failed to fetch colleges list:", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchColleges();
  }, []);

  // Fetch details for both colleges when selections change
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!collegeCodeA || !collegeCodeB) return;
      if (collegeCodeA === collegeCodeB) {
        setError("Please select two different colleges to compare.");
        setDataA(null);
        setDataB(null);
        return;
      }

      setLoadingData(true);
      setError("");
      try {
        const [resA, resB] = await Promise.all([
          axios.get(`http://localhost:8000/api/colleges/${collegeCodeA}`),
          axios.get(`http://localhost:8000/api/colleges/${collegeCodeB}`)
        ]);
        setDataA(resA.data);
        setDataB(resB.data);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError("Failed to load college comparison data. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchComparisonData();
  }, [collegeCodeA, collegeCodeB]);

  // Group cutoffs by branch for College A and College B
  const getBranchCutoffsMap = (data: CollegeData | null, category: string) => {
    if (!data) return {};
    const map: Record<string, { R1?: number; R2?: number; R3?: number }> = {};
    data.records
      .filter(r => r.category === category)
      .forEach(r => {
        if (!map[r.branch]) map[r.branch] = {};
        const roundKey = r.round as "R1" | "R2" | "R3";
        map[r.branch][roundKey] = Number(r.cutoff);
      });
    return map;
  };

  const branchMapA = getBranchCutoffsMap(dataA, selectedCategory);
  const branchMapB = getBranchCutoffsMap(dataB, selectedCategory);

  // Overlapping branches offered by BOTH colleges
  const branchesA = Object.keys(branchMapA);
  const branchesB = Object.keys(branchMapB);
  const overlappingBranches = branchesA.filter(b => branchesB.includes(b)).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="text-center mb-10">
        <span className="bg-blue-100 text-blue-800 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
          Side-By-Side Comparison
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mt-3 mb-2">
          Compare Colleges
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium">
          Select two KCET colleges and a seat category to compare branch availability and round cutoffs.
        </p>
      </div>

      {/* Selectors Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-10">
        {/* College A Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            First College (A)
          </label>
          <select
            value={collegeCodeA}
            disabled={loadingList}
            onChange={(e) => setCollegeCodeA(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold cursor-pointer text-sm truncate"
          >
            {collegesList.map(item => (
              <option key={item.collegeCode} value={item.collegeCode}>
                [{item.collegeCode}] {item.collegeName}
              </option>
            ))}
          </select>
        </div>

        {/* College B Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Second College (B)
          </label>
          <select
            value={collegeCodeB}
            disabled={loadingList}
            onChange={(e) => setCollegeCodeB(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold cursor-pointer text-sm truncate"
          >
            {collegesList.map(item => (
              <option key={item.collegeCode} value={item.collegeCode}>
                [{item.collegeCode}] {item.collegeName}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold cursor-pointer text-sm"
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4.5 rounded-2xl text-xs font-extrabold border border-rose-100 text-center mb-8">
          {error}
        </div>
      )}

      {loadingData ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs">Loading comparison details...</p>
        </div>
      ) : dataA && dataB ? (
        <div className="flex flex-col gap-8">
          {/* Side by Side Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* College A Info Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="bg-blue-600/30 text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  College A ({dataA.collegeCode})
                </span>
                <h3 className="font-extrabold text-xl mt-2 mb-1 leading-snug">{dataA.collegeName}</h3>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Total Branches Offered:</span>
                <span className="text-lg font-black text-blue-400">{branchesA.length}</span>
              </div>
            </div>

            {/* College B Info Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="bg-indigo-600/30 text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  College B ({dataB.collegeCode})
                </span>
                <h3 className="font-extrabold text-xl mt-2 mb-1 leading-snug">{dataB.collegeName}</h3>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Total Branches Offered:</span>
                <span className="text-lg font-black text-indigo-400">{branchesB.length}</span>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-extrabold text-lg text-slate-800">Overlapping Branch Cutoff Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Showing side-by-side round cutoffs for branches offered by both colleges</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4.5" rowSpan={2}>Overlapping Branch Name</th>
                    <th className="px-4 py-2 text-center border-l border-slate-100" colSpan={3}>{dataA.collegeCode} (College A)</th>
                    <th className="px-4 py-2 text-center border-l border-slate-100" colSpan={3}>{dataB.collegeCode} (College B)</th>
                  </tr>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
                    <th className="px-4 py-2 border-l border-slate-100">Round 1</th>
                    <th className="px-4 py-2">Round 2</th>
                    <th className="px-4 py-2">Round 3</th>
                    <th className="px-4 py-2 border-l border-slate-100">Round 1</th>
                    <th className="px-4 py-2">Round 2</th>
                    <th className="px-4 py-2">Round 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {overlappingBranches.length > 0 ? (
                    overlappingBranches.map(branchName => {
                      const cutA = branchMapA[branchName];
                      const cutB = branchMapB[branchName];

                      const formatCutoff = (val?: number) => {
                        return val ? val.toLocaleString() : "-";
                      };

                      // Helper to highlight which cutoff is more competitive (lower number)
                      const isMoreCompetitive = (valA?: number, valB?: number) => {
                        if (!valA || !valB) return "";
                        return valA < valB ? "A" : "B";
                      };

                      const compR1 = isMoreCompetitive(cutA.R1, cutB.R1);
                      const compR2 = isMoreCompetitive(cutA.R2, cutB.R2);
                      const compR3 = isMoreCompetitive(cutA.R3, cutB.R3);

                      return (
                        <tr key={branchName} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 text-sm max-w-sm">
                            {branchName}
                          </td>
                          {/* College A Round 1, 2, 3 */}
                          <td className={`px-4 py-4 text-center border-l border-slate-100 font-mono ${compR1 === "A" ? "text-blue-700 bg-blue-50/30 font-bold" : "text-slate-500"}`}>
                            {formatCutoff(cutA.R1)}
                          </td>
                          <td className={`px-4 py-4 text-center font-mono ${compR2 === "A" ? "text-blue-700 bg-blue-50/30 font-bold" : "text-slate-500"}`}>
                            {formatCutoff(cutA.R2)}
                          </td>
                          <td className={`px-4 py-4 text-center font-mono ${compR3 === "A" ? "text-blue-700 bg-blue-50/30 font-bold" : "text-slate-500"}`}>
                            {formatCutoff(cutA.R3)}
                          </td>
                          {/* College B Round 1, 2, 3 */}
                          <td className={`px-4 py-4 text-center border-l border-slate-100 font-mono ${compR1 === "B" ? "text-indigo-700 bg-indigo-50/30 font-bold" : "text-slate-500"}`}>
                            {formatCutoff(cutB.R1)}
                          </td>
                          <td className={`px-4 py-4 text-center font-mono ${compR2 === "B" ? "text-indigo-700 bg-indigo-50/30 font-bold" : "text-slate-500"}`}>
                            {formatCutoff(cutB.R2)}
                          </td>
                          <td className={`px-4 py-4 text-center font-mono ${compR3 === "B" ? "text-indigo-700 bg-indigo-50/30 font-bold" : "text-slate-500"}`}>
                            {formatCutoff(cutB.R3)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400 text-xs font-semibold">
                        No overlapping branches found for these two colleges under this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {overlappingBranches.length > 0 && (
              <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-500 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-200 inline-block"></span>
                  Highlighted Cell indicates more competitive cutoff (lower rank required)
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Compare?</h3>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Select two different colleges from the dropdowns above to see side-by-side cutoff ranks.
          </p>
        </div>
      )}
    </div>
  );
}
