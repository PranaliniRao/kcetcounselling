const cutoffs = require("../data/cutoffs-all.json");

const badKeywords = [
  "ROAD",
  "POST",
  "VILLAGE",
  "BENGALURU",
  "BENALURU",
  "KALABURAGI",
  "MYSURU"
];

const badRecords = cutoffs.filter(record =>
  badKeywords.some(keyword =>
    record.branch.includes(keyword)
  )
);

console.log("Bad Records:", badRecords.length);

badRecords.slice(0, 50).forEach(record => {
  console.log("\n----------------");
  console.log("College:", record.collegeCode);
  console.log("Branch :", record.branch);
});