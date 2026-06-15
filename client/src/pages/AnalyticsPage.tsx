// src/pages/AnalyticsPage.tsx

import { useState, useEffect } from "react";
import axios from "axios";

interface BranchStat {
  branch: string;
  collegeCount: number;
  avgCutoff: number | null;
}

interface StatsResponse {
  totalColleges: number;
  totalBranches: number;
  popularity: BranchStat[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/branches/stats`);
        setStats(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setError("Failed to load statistics from the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxCollegeCount = Math.max(...stats.popularity.map(p => p.collegeCount)) || 1;
  const mostPopular = stats.popularity[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="text-center mb-10">
        <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
          Market Insights
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mt-3 mb-2">
          Counselling Analytics
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium">
          Comprehensive statistics on college distributions, popular engineering branches, and average cutoff competitiveness.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Colleges */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800 leading-none mb-1">
              {stats.totalColleges}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Colleges
            </div>
          </div>
        </div>

        {/* Total Unique Branches */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800 leading-none mb-1">
              {stats.totalBranches}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unique Branches
            </div>
          </div>
        </div>

        {/* Most Popular Branch */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-slate-800 truncate mb-1" title={mostPopular?.branch}>
              {mostPopular ? mostPopular.branch : "None"}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Most Widely Offered Branch
            </div>
          </div>
        </div>
      </div>

      {/* Branch Popularity Distribution Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="mb-8 border-b border-slate-100 pb-5">
          <h2 className="text-xl font-extrabold text-slate-800">Branch Popularity Index</h2>
          <p className="text-xs text-slate-400 mt-0.5">Top 10 branches sorted by the number of colleges offering them and average General Merit Round 3 Cutoff ranks</p>
        </div>

        <div className="flex flex-col gap-6.5">
          {stats.popularity.map((item, index) => {
            const percentage = (item.collegeCount / maxCollegeCount) * 100;
            return (
              <div key={item.branch} className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-6">
                {/* Branch name label */}
                <div className="md:w-72 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 leading-snug truncate" title={item.branch}>
                      {item.branch}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="h-6.5 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative">
                    {/* Animated fill */}
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-r-lg shadow-inner transition-all duration-500"
                    ></div>
                    
                    {/* Count label placed inside progress bar */}
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">
                      {item.collegeCount} colleges
                    </span>
                  </div>
                  
                  {/* Competitiveness badge */}
                  <span className="shrink-0 min-w-[130px] text-right font-mono text-[10px] font-bold text-slate-500">
                    {item.avgCutoff ? `Avg Cutoff: ${item.avgCutoff.toLocaleString()}` : "No Cutoff"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
