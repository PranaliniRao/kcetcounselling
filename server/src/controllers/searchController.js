const cutoffs = require("../../data/cutoffs-all.json");
const cleanBranch = require("../utils/cleanBranch");

const searchColleges = (req, res) => {
  const {
    rank,
    category,
    round,
    branches,
    rankRange,
    customMinRank,
    customMaxRank
  } = req.query;

  const userRank = Number(rank);

  if (!userRank) {
    return res.status(400).json({
      message: "Rank is required"
    });
  }

  // Parse branches query parameter (can be array or comma-separated string)
  let branchList = [];
  if (branches) {
    if (Array.isArray(branches)) {
      branchList = branches;
    } else if (typeof branches === "string") {
      branchList = branches.split(",").map(b => b.trim()).filter(Boolean);
    }
  }
  // Normalize client branch inputs
  branchList = branchList.map(b => cleanBranch(b)).filter(Boolean);

  // Determine rank range constraints
  let minLimit = 0;
  let maxLimit = Infinity;

  if (rankRange === "500") {
    minLimit = userRank - 500;
    maxLimit = userRank + 500;
  } else if (rankRange === "1000") {
    minLimit = userRank - 1000;
    maxLimit = userRank + 1000;
  } else if (rankRange === "2000") {
    minLimit = userRank - 2000;
    maxLimit = userRank + 2000;
  } else if (rankRange === "5000") {
    minLimit = userRank - 5000;
    maxLimit = userRank + 5000;
  } else if (rankRange === "custom") {
    minLimit = Number(customMinRank) || 0;
    maxLimit = Number(customMaxRank) || Infinity;
  }

  const results = cutoffs
    .filter(record => {
      const cutoff = Number(record.cutoff);

      if (isNaN(cutoff)) return false;

      // Filter by category and round
      if (record.category !== category || record.round !== round) {
        return false;
      }

      // Filter by selected branches if any (using normalized branch names)
      if (branchList.length > 0 && !branchList.includes(cleanBranch(record.branch))) {
        return false;
      }

      // Filter by rank range limits
      if (cutoff < minLimit || cutoff > maxLimit) {
        return false;
      }

      return true;
    })
    .map(record => {
      const cutoff = Number(record.cutoff);
      let status = "RISKY";

      if (cutoff >= userRank) {
        status = "SAFE";
      } else if (cutoff >= userRank * 0.9) {
        status = "MODERATE";
      }

      return {
        ...record,
        branch: cleanBranch(record.branch),
        status
      };
    });

  // Sort results by closeness to the user's rank
  results.sort((a, b) => Math.abs(Number(a.cutoff) - userRank) - Math.abs(Number(b.cutoff) - userRank));

  // Compute category stats across the entire filtered list before slicing
  const safeCount = results.filter(r => r.status === "SAFE").length;
  const moderateCount = results.filter(r => r.status === "MODERATE").length;
  const riskyCount = results.filter(r => r.status === "RISKY").length;

  // Limit results to top 100 to prevent sending thousands of records
  const finalResults = results.slice(0, 100);

  res.json({
    total: results.length,
    safeCount,
    moderateCount,
    riskyCount,
    results: finalResults
  });
};

module.exports = {
  searchColleges
};