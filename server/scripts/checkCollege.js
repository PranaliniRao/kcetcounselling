const fs = require("fs");
const path = require("path");

/**
 * Loads the combined cutoffs dataset and filters it by college code.
 * Prints branches, record count, and verifies major colleges if no code is provided.
 */
function checkCollege() {
  const datasetPath = path.join(__dirname, "..", "data", "cutoffs-all.json");

  if (!fs.existsSync(datasetPath)) {
    console.error(`Error: Merged dataset not found at ${datasetPath}. Please run mergeRounds.js first.`);
    process.exit(1);
  }

  console.log("Loading cutoffs-all.json...");
  const records = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  console.log(`Loaded ${records.length} total records.`);

  const args = process.argv.slice(2);
  const targetCode = args[0] ? args[0].toUpperCase() : null;

  if (targetCode) {
    // Filter for the specific college code
    const collegeRecords = records.filter(r => r.collegeCode === targetCode);

    if (collegeRecords.length === 0) {
      console.log(`No records found for college code: ${targetCode}`);
      return;
    }

    const collegeName = collegeRecords[0].collegeName;
    console.log(`\n================================`);
    console.log(`COLLEGE DETAILS: ${targetCode}`);
    console.log(`================================`);
    console.log(`Name: ${collegeName}`);
    console.log(`Total Records: ${collegeRecords.length}`);

    // Extract unique branches and rounds
    const branches = new Set();
    const roundCounts = {};

    for (const r of collegeRecords) {
      branches.add(r.branch);
      roundCounts[r.round] = (roundCounts[r.round] || 0) + 1;
    }

    console.log(`\nUnique Branches (${branches.size}):`);
    Array.from(branches).sort().forEach(branch => {
      console.log(`- ${branch}`);
    });

    console.log(`\nRecords count by Round:`);
    Object.keys(roundCounts).forEach(round => {
      console.log(`- ${round}: ${roundCounts[round]} cutoffs`);
    });

  } else {
    // Verify major colleges automatically if no code is passed
    const majorColleges = [
      { code: "E003", name: "BMSCE" },
      { code: "E005", name: "RVCE" },
      { code: "E006", name: "MSRIT" },
      { code: "E007", name: "DSCE" },
      { code: "E009", name: "PES" }
    ];

    console.log("\n=======================================================");
    console.log("VERIFYING MAJOR COLLEGES DATA");
    console.log("=======================================================");

    majorColleges.forEach(col => {
      const colRecords = records.filter(r => r.collegeCode === col.code);
      if (colRecords.length === 0) {
        console.log(`[ ] ${col.code} (${col.name}): No records found.`);
        return;
      }

      const collegeName = colRecords[0].collegeName;
      const branches = new Set(colRecords.map(r => r.branch));
      const rounds = new Set(colRecords.map(r => r.round));

      console.log(`\n[x] College: ${col.code} (${col.name})`);
      console.log(`    Full Name: ${collegeName}`);
      console.log(`    Total Records: ${colRecords.length}`);
      console.log(`    Rounds Present: ${Array.from(rounds).join(", ")}`);
      console.log(`    Unique Branches: ${branches.size}`);
      console.log(`    Sample Branches:`);
      Array.from(branches).slice(0, 3).forEach(b => console.log(`      - ${b}`));
    });

    console.log("\nTo query a specific college, run:");
    console.log("node scripts/checkCollege.js <collegeCode>");
  }
}

checkCollege();
