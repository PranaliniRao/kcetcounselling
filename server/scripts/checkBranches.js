const cutoffs = require("../data/cutoffs-all.json");

const branches = [
  ...new Set(
    cutoffs.map(item => item.branch)
  )
];

console.log("\nTotal Unique Branches:");
console.log(branches.length);

console.log("\nFirst 200 Branches:\n");

branches
  .sort()
  .slice(0, 200)
  .forEach((branch, index) => {
    console.log(`${index + 1}. ${branch}`);
  });