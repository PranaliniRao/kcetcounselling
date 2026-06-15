// src/pages/SavedPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { shortlistService } from "../utils/shortlistService";
import type { ShortlistItem } from "../utils/shortlistService";
import { toTitleCase } from "../utils/titleCase";

export default function SavedPage() {
  const [shortlistItems, setShortlistItems] = useState<ShortlistItem[]>([]);

  // Function to load bookmarks from shortlistService
  const loadShortlist = () => {
    const list = shortlistService.get();
    // Sort alphabetically by college name
    list.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
    setShortlistItems(list);
  };

  useEffect(() => {
    loadShortlist();
    window.addEventListener("storage", loadShortlist);
    return () => window.removeEventListener("storage", loadShortlist);
  }, []);

  const handleRemove = (item: ShortlistItem) => {
    shortlistService.remove(item.collegeCode, item.branch, item.category, item.round);
    loadShortlist();
  };

  const handleChangeType = (item: ShortlistItem, newType: "Dream" | "Target" | "Safe") => {
    const { shortlistType: _, ...rest } = item;
    shortlistService.save(rest, newType);
    loadShortlist();
  };

  const dreamItems = shortlistItems.filter(c => c.shortlistType === "Dream");
  const targetItems = shortlistItems.filter(c => c.shortlistType === "Target");
  const safeItems = shortlistItems.filter(c => c.shortlistType === "Safe");

  const renderSection = (
    title: string,
    list: ShortlistItem[],
    typeColor: string,
    typeBg: string,
    sectionType: "Dream" | "Target" | "Safe"
  ) => {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${typeColor}`}></span>
            {title}
          </h2>
          <span className={`${typeBg} ${typeColor} text-xs font-black px-2.5 py-0.5 rounded-full`}>
            {list.length} {list.length === 1 ? "option" : "options"}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {list.length > 0 ? (
            list.map(item => {
              const key = `${item.collegeCode}-${item.branch}-${item.category}-${item.round}`;
              return (
                <div
                  key={key}
                  className="group border border-slate-100 p-4 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-slate-50/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {item.collegeCode}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          Round {item.round.replace("R", "")}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        {item.status && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              item.status === "SAFE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : item.status === "MODERATE"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-1 leading-snug group-hover:text-blue-700 transition-colors whitespace-normal break-words">
                        <Link to={`/college/${item.collegeCode}`}>{toTitleCase(item.collegeName)}</Link>
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-2 flex items-start gap-1.5 whitespace-normal break-words leading-relaxed">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{toTitleCase(item.branch)}</span>
                      </p>
                      <div className="text-xs text-slate-500 font-bold mt-2.5">
                        Cutoff Rank: <span className="font-mono text-slate-800 font-extrabold">{Number(item.cutoff).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors self-start cursor-pointer"
                      title="Remove from Shortlist"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Move to another category */}
                  <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3.5 border-t border-slate-100">
                    <Link
                      to={`/college/${item.collegeCode}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      View Details
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <div className="flex gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 font-bold">Move:</span>
                      {(["Dream", "Target", "Safe"] as const).map(t => {
                        if (t === sectionType) return null;
                        return (
                          <button
                            key={t}
                            onClick={() => handleChangeType(item, t)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black tracking-wide cursor-pointer"
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-bold">
              No options in this category
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="text-center mb-10">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
          Saved List
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mt-3 mb-2">
          My Shortlisted Options
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium">
          Track and organize your preferred branch and college combinations into Dream, Target, and Safe folders.
        </p>
      </div>

      {shortlistItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Dream Category */}
          {renderSection("Dream Options", dreamItems, "text-rose-600", "bg-rose-50", "Dream")}

          {/* Target Category */}
          {renderSection("Target Options", targetItems, "text-amber-500", "bg-amber-50", "Target")}

          {/* Safe Category */}
          {renderSection("Safe Options", safeItems, "text-emerald-600", "bg-emerald-50", "Safe")}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto min-h-[400px]">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Shortlist is empty</h3>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
            Explore college option combinations on the Search page and add them to your shortlist.
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Find Colleges
          </Link>
        </div>
      )}
    </div>
  );
}

