const cutoffs = require("../data/cutoffs-all.json");
const cleanBranch = require("../src/utils/cleanBranch");

const branches = [
  ...new Set(
    cutoffs.map(item =>
      cleanBranch(item.branch)
    )
  )
].sort();

console.log(
  "Total Clean Branches:",
  branches.length
);

console.log(
  branches.slice(0, 100)
);