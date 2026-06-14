const cutoffs = require("../data/cutoffs-all.json");

function normalizeBranch(branch) {

  return branch

    .replace(/\s+/g, " ")

    .replace(/COMMUNICATIO N/g, "COMMUNICATION")
    .replace(/INSTRUMENTATI ON/g, "INSTRUMENTATION")
    .replace(/TELECOMMUNIC ATION/g, "TELECOMMUNICATION")
    .replace(/ENVIRONMENTA L/g, "ENVIRONMENTAL")
    .replace(/DAT A/g, "DATA")
    .replace(/ARTIFICIA L/g, "ARTIFICIAL")
    .replace(/INTERNE T/g, "INTERNET")
    .replace(/AERO SPACE/g, "AEROSPACE")

    .replace(/^B TECH IN /, "")
    .replace(/^B\.TECH IN /, "")
    .replace(/^BTECH IN /, "")

    .trim();
}

const branches = [
  ...new Set(
    cutoffs.map(item =>
      normalizeBranch(item.branch)
    )
  )
];

console.log(
  "Unique branches after normalization:",
  branches.length
);

console.log(
  branches
    .sort()
    .slice(0, 100)
);