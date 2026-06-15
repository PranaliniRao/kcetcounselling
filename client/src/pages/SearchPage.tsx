// src/pages/SearchPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CATEGORY_OPTIONS } from "../constants/categories";
import { CATEGORY_DESCRIPTIONS } from "../constants/categoryDescriptions";
import { BRANCH_CATEGORIES } from "../constants/branchCategories";
import { categorizeBranch } from "../utils/categorizeBranch";
import { shortlistService } from "../utils/shortlistService";
import { toTitleCase } from "../utils/titleCase";

// TypeScript interface for search results returned from the API
interface SearchResult {
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  round: string;
  cutoff: string;
  status: string;
}

function SearchPage() {
  // Search parameters states
  const [category, setCategory] = useState(() => {
    return localStorage.getItem("kcet_user_category") || "GM";
  });
  const [round, setRound] = useState(() => {
    return localStorage.getItem("kcet_user_round") || "R3";
  });
  const [rank, setRank] = useState(() => {
    return localStorage.getItem("kcet_user_rank") || "";
  });

  const handleRankChange = (val: string) => {
    setRank(val);
    if (val && Number(val) > 0) {
      localStorage.setItem("kcet_user_rank", val);
    } else {
      localStorage.removeItem("kcet_user_rank");
    }
    window.dispatchEvent(new Event("storage"));
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    localStorage.setItem("kcet_user_category", val);
    window.dispatchEvent(new Event("storage"));
  };

  const handleRoundChange = (val: string) => {
    setRound(val);
    localStorage.setItem("kcet_user_round", val);
    window.dispatchEvent(new Event("storage"));
  };


  // Rank Range states
  const [rankRange, setRankRange] = useState("exact");
  const [customMinRank, setCustomMinRank] = useState("");
  const [customMaxRank, setCustomMaxRank] = useState("");

  // Dynamic branch list states
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [branchSearch, setBranchSearch] = useState("");

  // Shortlist map of active options
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});

  // Accordion open/collapse states for branch categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(BRANCH_CATEGORIES).forEach((cat) => {
      initial[cat] = true;
    });
    return initial;
  });

  // Result and statistics states
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [safeCount, setSafeCount] = useState(0);
  const [moderateCount, setModerateCount] = useState(0);
  const [riskyCount, setRiskyCount] = useState(0);

  // UI status states
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unique branches dynamically on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/branches`);
        setBranches(response.data);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };
    fetchBranches();
  }, []);

  // Validation: Check total branches API vs total branches rendered in categories
  useEffect(() => {
    if (branches.length > 0) {
      const grouped: Record<string, string[]> = {};
      Object.keys(BRANCH_CATEGORIES).forEach((c) => {
        grouped[c] = [];
      });
      branches.forEach((b) => {
        const cat = categorizeBranch(b);
        if (grouped[cat]) {
          grouped[cat].push(b);
        } else {
          grouped["Design & Others"].push(b);
        }
      });
      
      let totalRendered = 0;
      Object.values(grouped).forEach((list) => {
        totalRendered += list.length;
      });

      console.log(`Total Branches from API: ${branches.length}`);
      console.log(`Total Branches Rendered: ${totalRendered}`);
    }
  }, [branches]);

  // Load saved shortlist items map
  const loadSavedMap = () => {
    const list = shortlistService.get();
    const map: Record<string, string> = {};
    list.forEach((item) => {
      const key = `${item.collegeCode}-${item.branch}-${item.category}-${item.round}`;
      map[key] = item.shortlistType;
    });
    setSavedMap(map);
  };

  useEffect(() => {
    loadSavedMap();
    
    const syncFromStorage = () => {
      loadSavedMap();
      const storedRank = localStorage.getItem("kcet_user_rank") || "";
      const storedCategory = localStorage.getItem("kcet_user_category") || "GM";
      const storedRound = localStorage.getItem("kcet_user_round") || "R3";
      
      setRank(storedRank);
      setCategory(storedCategory);
      setRound(storedRound);
    };

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const handleBookmark = (item: SearchResult, type: "Dream" | "Target" | "Safe") => {
    const key = `${item.collegeCode}-${item.branch}-${item.category}-${item.round}`;
    const currentType = savedMap[key];
    
    if (currentType === type) {
      shortlistService.remove(item.collegeCode, item.branch, item.category, item.round);
    } else {
      shortlistService.save(item, type);
    }
  };

  // Toggle single branch select
  const handleToggleBranch = (branchName: string) => {
    if (selectedBranches.includes(branchName)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branchName));
    } else {
      setSelectedBranches([...selectedBranches, branchName]);
    }
  };

  // Category-level Select/Deselect All Toggle
  const handleToggleCategoryBranches = (_catName: string, catBranches: string[]) => {
    const allSelected = catBranches.every((b) => selectedBranches.includes(b));
    if (allSelected) {
      // Remove all branches in this category
      setSelectedBranches(selectedBranches.filter((b) => !catBranches.includes(b)));
    } else {
      // Add missing branches in this category
      const toAdd = catBranches.filter((b) => !selectedBranches.includes(b));
      setSelectedBranches([...selectedBranches, ...toAdd]);
    }
  };

  const handleSelectAllBranches = () => {
    setSelectedBranches([...branches]);
  };

  const handleClearAllBranches = () => {
    setSelectedBranches([]);
  };

  const toggleAccordion = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleSearch = async () => {
    if (!rank || Number(rank) <= 0) {
      alert("Please enter a valid KCET rank.");
      return;
    }

    if (rankRange === "custom") {
      if (!customMinRank || !customMaxRank) {
        alert("Please enter both minimum and maximum ranks for the custom range.");
        return;
      }
      if (Number(customMinRank) > Number(customMaxRank)) {
        alert("Minimum rank cannot be greater than maximum rank.");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/search",
        {
          params: {
            rank,
            category,
            round,
            branches: selectedBranches.join(","),
            rankRange,
            customMinRank,
            customMaxRank,
          },
        }
      );

      setResults(response.data.results);
      setTotalCount(response.data.total);
      setSafeCount(response.data.safeCount);
      setModerateCount(response.data.moderateCount);
      setRiskyCount(response.data.riskyCount);
      setSearched(true);
    } catch (error) {
      console.error("Failed to search colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group the branches dynamically for display in the sidebar
  const groupedBranches: Record<string, string[]> = {};
  Object.keys(BRANCH_CATEGORIES).forEach((cat) => {
    groupedBranches[cat] = [];
  });

  // Keep track of the total (unfiltered) counts per category for the count badges
  const totalCategoryCounts: Record<string, number> = {};
  Object.keys(BRANCH_CATEGORIES).forEach((cat) => {
    totalCategoryCounts[cat] = 0;
  });

  branches.forEach((b) => {
    const cat = categorizeBranch(b);
    if (totalCategoryCounts[cat] !== undefined) {
      totalCategoryCounts[cat]++;
    } else {
      totalCategoryCounts["Design & Others"]++;
    }
  });

  // Filter and populate categories
  branches.forEach((branchName) => {
    if (branchSearch && !branchName.toLowerCase().includes(branchSearch.toLowerCase())) {
      return;
    }
    const cat = categorizeBranch(branchName);
    if (groupedBranches[cat]) {
      groupedBranches[cat].push(branchName);
    } else {
      groupedBranches["Design & Others"].push(branchName);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Decorative top header bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            KCET 2025 ALLOTMENT
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-2 animate-fade-in">
            KCET Counselling Predictor
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto font-light">
            Enter your rank, filter by preferred branches and options, and find closest college matches.
          </p>
        </div>
      </div>

      {/* Redesigned spacious 4-column layout on large viewports */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Column 1: Search Parameters */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Parameters
            </h2>

            {/* Rank Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Your KCET Rank
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={rank}
                onChange={(e) => handleRankChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            {/* Rank Range Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cutoff Rank Range
              </label>
              <select
                value={rankRange}
                onChange={(e) => setRankRange(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
              >
                <option value="exact">Exact Rank (All matches)</option>
                <option value="500">±500 ranks</option>
                <option value="1000">±1000 ranks</option>
                <option value="2000">±2000 ranks</option>
                <option value="5000">±5000 ranks</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Min/Max Rank Inputs */}
            {rankRange === "custom" && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Min Rank
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={customMinRank}
                    onChange={(e) => setCustomMinRank(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Max Rank
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 20000"
                    value={customMaxRank}
                    onChange={(e) => setCustomMaxRank(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {/* Category Dynamic Description Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 mt-1">
                <span className="font-bold text-blue-700">{category}: </span>
                {CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Selected reservation category"}
              </div>
            </div>

            {/* Round Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Counselling Round
              </label>
              <select
                value={round}
                onChange={(e) => handleRoundChange(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
              >
                <option value="R1">Round 1 (R1)</option>
                <option value="R2">Round 2 (R2)</option>
                <option value="R3">Round 3 (R3)</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3.5 mt-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? "Searching..." : "Search Colleges"}
            </button>
          </div>

          {/* Column 2: Spacious Grouped Branch Filter */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Branch Filter
              </h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {selectedBranches.length}
              </span>
            </div>

            {/* Search within branches */}
            <input
              type="text"
              placeholder="Search branches..."
              value={branchSearch}
              onChange={(e) => setBranchSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />

            {/* Toggle Utilities */}
            <div className="flex justify-between text-xs font-bold text-blue-600 border-b border-slate-50 pb-2">
              <button onClick={handleSelectAllBranches} className="hover:text-blue-800 active:scale-95 transition-all">
                Select All
              </button>
              <button onClick={handleClearAllBranches} className="hover:text-blue-800 active:scale-95 transition-all">
                Clear All
              </button>
            </div>

            {/* Expanded Accordion List Container with Internal Scroll */}
            <div className="max-h-[480px] overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin">
              {Object.entries(groupedBranches).some(([_, list]) => list.length > 0) ? (
                Object.entries(groupedBranches).map(([catName, catBranches]) => {
                  if (catBranches.length === 0) return null;

                  // Auto-expand if the search query matches branches inside this category
                  const isExpanded = branchSearch ? true : expandedCategories[catName];
                  const isAllSelected = catBranches.every((b) => selectedBranches.includes(b));
                  const isSomeSelected = catBranches.some((b) => selectedBranches.includes(b)) && !isAllSelected;
                  const totalCount = totalCategoryCounts[catName] || 0;

                  return (
                    <div key={catName} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                      {/* Group Header showing Category counts */}
                      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-b border-slate-100 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Group Checkbox */}
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) {
                                el.indeterminate = isSomeSelected;
                              }
                            }}
                            onChange={() => handleToggleCategoryBranches(catName, catBranches)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-black text-slate-700 leading-tight truncate">
                            {catName} ({totalCount})
                          </span>
                        </div>
                        
                        {/* Collapse button */}
                        <button
                          onClick={() => toggleAccordion(catName)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 shrink-0"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Collapsible Branches List - No content truncation or clipping */}
                      {isExpanded && (
                        <div className="p-2.5 flex flex-col gap-1 bg-white">
                          {catBranches.map((branchName) => (
                            <label
                              key={branchName}
                              className="flex items-start gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-50 text-left"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBranches.includes(branchName)}
                                onChange={() => handleToggleBranch(branchName)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                              />
                              {/* Wrap text fully without truncation */}
                              <span className="text-[11px] font-semibold text-slate-600 leading-snug whitespace-normal break-words block pr-2">
                                {toTitleCase(branchName)}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs font-medium text-slate-400 animate-pulse">
                  No categories match your search
                </div>
              )}
            </div>
          </div>

          {/* Columns 3 & 4: Results Display */}
          <div className="lg:col-span-2">
            
            {searched && results.length > 0 ? (
              <div className="flex flex-col gap-6">
                
                {/* Results Statistics Dashboard (4-Column Layout) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total matches */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 hidden sm:block">
                      <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-none mb-1">{totalCount}</div>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">Total Matches</div>
                    </div>
                  </div>

                  {/* SAFE */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hidden sm:block">
                      <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 leading-none mb-1">{safeCount}</div>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">SAFE Options</div>
                    </div>
                  </div>

                  {/* MODERATE */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600 hidden sm:block">
                      <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-extrabold text-amber-600 leading-none mb-1">{moderateCount}</div>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">MODERATE</div>
                    </div>
                  </div>

                  {/* RISKY */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-600 hidden sm:block">
                      <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-extrabold text-rose-600 leading-none mb-1">{riskyCount}</div>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">RISKY Options</div>
                    </div>
                  </div>
                </div>

                {/* Results Header */}
                <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800">Available Options</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Sorted by closeness to your rank</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    Showing top {results.length} of {totalCount}
                  </span>
                </div>

                {/* College Result Cards List */}
                <div className="grid grid-cols-1 gap-4.5">
                  {results.map((item, index) => {
                    const cutoffDiff = Number(item.cutoff) - Number(rank);
                    const isHigher = cutoffDiff >= 0;
                    const key = `${item.collegeCode}-${item.branch}-${item.category}-${item.round}`;
                    const savedType = savedMap[key] || null;

                    return (
                      <div
                        key={index}
                        className="group bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          {/* Left Info Section */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                                {item.collegeCode}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">
                                Round {item.round.replace("R", "")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">
                                Cat: {item.category}
                              </span>
                              
                              {/* Shortlist Badges */}
                              {savedType && (
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                  savedType === "Dream"
                                    ? "bg-rose-50 text-rose-600 border-rose-100"
                                    : savedType === "Target"
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                }`}>
                                  ★ {savedType}
                                </span>
                              )}
                            </div>
                            
                            {/* Link to College Details Page - Full college name rendered, no clipping */}
                            <h3 className="font-extrabold text-lg text-slate-800 leading-snug group-hover:text-blue-700 transition-colors whitespace-normal break-words">
                              <Link to={`/college/${item.collegeCode}`} className="hover:underline">
                                {toTitleCase(item.collegeName)}
                              </Link>
                            </h3>
                            
                            {/* Branch Name wraps properly on multiple lines */}
                            <p className="text-sm font-semibold text-slate-500 mt-2 flex items-start gap-1.5 whitespace-normal break-words leading-relaxed">
                              <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span>{toTitleCase(item.branch)}</span>
                            </p>

                            <div className="flex gap-2 items-center mt-3">
                              <Link
                                to={`/college/${item.collegeCode}`}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                              >
                                View College Matrix
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          </div>

                          {/* Right Cutoff & Status Section */}
                          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 gap-2.5 min-w-[170px] w-full md:w-auto">
                            <div className="text-left md:text-right">
                              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                Cutoff Rank
                              </div>
                              <div className="text-xl font-black text-slate-800 leading-none">
                                {Number(item.cutoff).toLocaleString()}
                              </div>
                              <div className={`text-[10px] font-bold mt-1 ${isHigher ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isHigher ? `+${cutoffDiff.toLocaleString()}` : `${cutoffDiff.toLocaleString()}`} ranks diff
                              </div>
                            </div>

                            {/* Status Pills and Bookmark controls */}
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border
                                  ${
                                    item.status === "SAFE"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : item.status === "MODERATE"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                              >
                                {item.status}
                              </span>
                              
                              {/* Option-specific Dream / Target / Safe bookmark pills with visual feedback */}
                              <div className="flex gap-1.5 mt-1">
                                {["Dream", "Target", "Safe"].map((type) => {
                                  const isSelected = savedType === type;
                                  return (
                                    <button
                                      key={type}
                                      onClick={() => handleBookmark(item, type as any)}
                                      className={`px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                                        isSelected
                                          ? type === "Dream"
                                            ? "bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/25"
                                            : type === "Target"
                                            ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25"
                                            : "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/25"
                                          : "bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100 hover:text-slate-700"
                                      }`}
                                    >
                                      {type}{isSelected ? " ✓" : ""}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Custom Empty State UI */
              <div className="text-center py-20 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {searched ? "No matching colleges found" : "Ready to predict your options?"}
                </h3>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-semibold">
                  {searched 
                    ? "No colleges match your rank, category, and branch selection."
                    : "Enter your rank and click Search Colleges"
                  }
                </p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default SearchPage;