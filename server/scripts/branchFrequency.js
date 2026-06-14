const cutoffs = require("../data/cutoffs-all.json");

const frequency = {};

cutoffs.forEach(item => {
  frequency[item.branch] =
    (frequency[item.branch] || 0) + 1;
});

const sorted = Object.entries(frequency)
  .sort((a, b) => b[1] - a[1]);

console.table(sorted.slice(0, 50));