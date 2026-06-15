const cutoffs = require("../data/cutoffs-all.json");

const categories = [
  ...new Set(
    cutoffs.map(item => item.category)
  )
].sort();

console.log(categories);
console.log("Total:", categories.length);