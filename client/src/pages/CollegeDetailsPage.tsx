// src/pages/CollegeDetailsPage.tsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CATEGORY_OPTIONS } from "../constants/categories";
import { CATEGORY_DESCRIPTIONS } from "../constants/categoryDescriptions";
import { shortlistService } from "../utils/shortlistService";
import { toTitleCase } from "../utils/titleCase";

interface CutoffRecord {
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  round: string;
  cutoff: string;
}

interface CollegeDetailsResponse {
  collegeCode: string;
  collegeName: string;
  records: CutoffRecord[];
}

export default function CollegeDetailsPage() {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collegeData, setCollegeData] = useState<CollegeDetailsResponse | null>(null);

  // Sync category and rank from localStorage if available
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("kcet_user_category") || "GM";
  });
  const [rankInput, setRankInput] = useState(() => {
    return localStorage.getItem("kcet_user_rank") || "";
  });

  const [savedMap, setSavedMap] = useState<Record<string, "Dream" | "Target" | "Safe">>({});

  const userRank = Number(rankInput) || 0;

  // Load saved shortlist items map
  const loadSavedMap = () => {
    const list = shortlistService.get();
    const map: Record<string, "Dream" | "Target" | "Safe"> = {};
    list.forEach((item) => {
      const key = `${item.collegeCode}-${item.branch}-${item.category}-${item.round}`;
      map[key] = item.shortlistType;
    });
    setSavedMap(map);
  };

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/colleges/${collegeCode}`);
        setCollegeData(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching college details:", err);
        setError("Failed to load college details. Please check the college code.");
      } finally {
        setLoading(false);
      }
    };

    if (collegeCode) {
      fetchCollegeDetails();
    }
  }, [collegeCode]);

  useEffect(() => {
    loadSavedMap();
    window.addEventListener("storage", loadSavedMap);
    return () => window.removeEventListener("storage", loadSavedMap);
  }, []);

  const handleRankChange = (val: string) => {
    setRankInput(val);
    if (val && Number(val) > 0) {
      localStorage.setItem("kcet_user_rank", val);
    } else {
      localStorage.removeItem("kcet_user_rank");
    }
    window.dispatchEvent(new Event("storage"));
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    localStorage.setItem("kcet_user_category", cat);
    window.dispatchEvent(new Event("storage"));
  };

  const handleToggleShortlist = (
    branchName: string,
    type: "Dream" | "Target" | "Safe",
    latestRound: string,
    latestCutoff: string,
    calculatedStatus: string
  ) => {
    if (!collegeCode || !collegeData) return;
    const itemKey = `${collegeCode}-${branchName}-${selectedCategory}-${latestRound}`;
    const currentType = savedMap[itemKey];

    if (currentType === type) {
      shortlistService.remove(collegeCode, branchName, selectedCategory, latestRound);
    } else {
      shortlistService.save(
        {
          collegeCode,
          collegeName: collegeData.collegeName,
          branch: branchName,
          category: selectedCategory,
          round: latestRound,
          cutoff: latestCutoff,
          status: calculatedStatus || "RISKY"
        },
        type
      );
    }
    loadSavedMap();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Loading college details...</p>
        </div>
      </div>
    );
  }

  if (error || !collegeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "College data could not be loaded."}</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10">
            Go back to search
          </Link>
        </div>
      </div>
    );
  }

  // Filter records by selected category
  const filteredRecords = collegeData.records.filter(r => r.category === selectedCategory);

  // Group records by branch to show cutoffs across round R1, R2, R3
  const branchMap: Record<string, { R1?: string; R2?: string; R3?: string }> = {};

  filteredRecords.forEach(record => {
    if (!branchMap[record.branch]) {
      branchMap[record.branch] = {};
    }
    const roundKey = record.round as "R1" | "R2" | "R3";
    branchMap[record.branch][roundKey] = record.cutoff;
  });

  const branchList = Object.keys(branchMap).sort();

  // Get description for category
  const categoryDesc = CATEGORY_DESCRIPTIONS[selectedCategory as keyof typeof CATEGORY_DESCRIPTIONS] || "Selected category";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </Link>
      </div>

      {/* College Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3.5 mb-3">
          <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">
            Code: {collegeData.collegeCode}
          </span>
          <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-lg border border-slate-700/50">
            Total Branches: {branchList.length}
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
          {toTitleCase(collegeData.collegeName)}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Filter Sidebar */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Reservation Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Your KCET Rank
            </label>
            <input
              type="number"
              value={rankInput}
              onChange={(e) => handleRankChange(e.target.value)}
              placeholder="Enter your KCET rank"
              className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 text-xs text-slate-600 mt-2">
            <strong className="text-blue-700 block mb-0.5">{selectedCategory} Description:</strong>
            {categoryDesc}
          </div>
        </div>

        {/* Right Column: Cutoff Matrix Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-extrabold text-lg text-slate-800">Branch Cutoff Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">Showing round-wise cutoffs for {selectedCategory}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Branch Description</th>
                    <th className="px-6 py-4 text-center">Round 1 (R1)</th>
                    <th className="px-6 py-4 text-center">Round 2 (R2)</th>
                    <th className="px-6 py-4 text-center">Round 3 (R3)</th>
                    <th className="px-6 py-4 text-center">Cutoff Trend</th>
                    {userRank > 0 && <th className="px-6 py-4 text-center">Prediction</th>}
                    <th className="px-6 py-4 text-center">Shortlist Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                  {branchList.length > 0 ? (
                    branchList.map(branchName => {
                      const cutoffs = branchMap[branchName];
                      const r1Val = Number(cutoffs.R1) || null;
                      const r3Val = Number(cutoffs.R3) || Number(cutoffs.R2) || null;

                      let trendElement = (
                        <span className="text-slate-400 text-xs">-</span>
                      );

                      if (r1Val && r3Val) {
                        const trendDiff = r3Val - r1Val;
                        if (trendDiff > 0) {
                          // Cutoff rank went up, easier to get (less competitive)
                          trendElement = (
                            <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              +{trendDiff.toLocaleString()}
                            </span>
                          );
                        } else if (trendDiff < 0) {
                          // Cutoff rank went down, harder to get (more competitive)
                          trendElement = (
                            <span className="inline-flex items-center gap-0.5 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                              </svg>
                              {trendDiff.toLocaleString()}
                            </span>
                          );
                        } else {
                          trendElement = (
                            <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              Steady
                            </span>
                          );
                        }
                      }

                      // Determine details for shortlisting the latest available round
                      const latestRound = cutoffs.R3 ? "R3" : cutoffs.R2 ? "R2" : cutoffs.R1 ? "R1" : null;
                      const latestCutoff = latestRound ? cutoffs[latestRound]! : null;
                      
                      let calculatedStatus = "";
                      if (latestCutoff && userRank) {
                        const cutoffNum = Number(latestCutoff);
                        if (cutoffNum >= userRank) {
                          calculatedStatus = "SAFE";
                        } else if (cutoffNum >= userRank * 0.9) {
                          calculatedStatus = "MODERATE";
                        } else {
                          calculatedStatus = "RISKY";
                        }
                      }

                      const itemKey = latestRound ? `${collegeData.collegeCode}-${branchName}-${selectedCategory}-${latestRound}` : "";
                      const currentShortlistType = savedMap[itemKey] || null;

                      return (
                        <tr key={branchName} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4.5 font-bold text-slate-800 max-w-md">
                            {toTitleCase(branchName)}
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            {cutoffs.R1 ? (
                              <span className="font-mono text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold">
                                {Number(cutoffs.R1).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            {cutoffs.R2 ? (
                              <span className="font-mono text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold">
                                {Number(cutoffs.R2).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            {cutoffs.R3 ? (
                              <span className="font-mono text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold">
                                {Number(cutoffs.R3).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            {trendElement}
                          </td>
                          {userRank > 0 && (
                            <td className="px-6 py-4.5 text-center">
                              {calculatedStatus ? (
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                                    calculatedStatus === "SAFE"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : calculatedStatus === "MODERATE"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  {calculatedStatus}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold text-xs">-</span>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4.5 text-center">
                            {latestRound && latestCutoff ? (
                              <div className="flex justify-center gap-1.5">
                                {(["Dream", "Target", "Safe"] as const).map((type) => {
                                  const isSelected = currentShortlistType === type;
                                  return (
                                    <button
                                      key={type}
                                      onClick={() =>
                                        handleToggleShortlist(
                                          branchName,
                                          type,
                                          latestRound,
                                          latestCutoff,
                                          calculatedStatus
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                                        isSelected
                                          ? type === "Dream"
                                            ? "bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/25"
                                            : type === "Target"
                                            ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25"
                                            : "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/25"
                                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                                      }`}
                                    >
                                      {type}{isSelected ? " ✓" : ""}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={userRank > 0 ? 7 : 6} className="text-center py-12 text-slate-400 text-xs font-medium">
                        No branches available for the selected category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
