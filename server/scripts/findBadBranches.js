const cutoffs = require("../data/cutoffs-all.json");

const branches = [
  ...new Set(
    cutoffs.map(item => item.branch)
  )
];

const badBranches = branches.filter(branch => {

  if (branch.length > 100) return true;

  if (
    branch.includes("ROAD") ||
    branch.includes("BANGALORE") ||
    branch.includes("MYSORE") ||
    branch.includes("SITE NO") ||
    branch.includes("LAYOUT") ||
    branch.includes("POST")
  ) {
    return true;
  }

  return false;
});

console.log("\nPossible Bad Branches:\n");

badBranches.forEach(branch => {
  console.log(branch);
});