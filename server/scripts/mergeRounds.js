const fs = require("fs");
const path = require("path");

/**
 * Merges cutoff datasets from R1, R2, and R3 into a single JSON file.
 */
function mergeRounds() {
  const dataDir = path.join(__dirname, "..", "data");
  
  const files = [
    { name: "cutoffs-r1.json", round: "R1" },
    { name: "cutoffs-r2.json", round: "R2" },
    { name: "cutoffs-r3.json", round: "R3" }
  ];

  let mergedRecords = [];

  console.log("Starting dataset merge...");

  for (const fileInfo of files) {
    const filePath = path.join(dataDir, fileInfo.name);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Error: Required file ${fileInfo.name} does not exist at ${filePath}. Please run generateCutoffs.js for this round first.`);
      process.exit(1);
    }

    try {
      console.log(`Reading ${fileInfo.name}...`);
      const fileData = fs.readFileSync(filePath, "utf8");
      const records = JSON.parse(fileData);
      
      console.log(`Loaded ${records.length} records for ${fileInfo.round}`);
      mergedRecords = mergedRecords.concat(records);
    } catch (err) {
      console.error(`Error processing ${fileInfo.name}:`, err);
      process.exit(1);
    }
  }

  const outputPath = path.join(dataDir, "cutoffs-all.json");
  console.log(`Saving combined dataset to ${outputPath}...`);
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(mergedRecords, null, 2));
    console.log(`\n================================`);
    console.log(`Success: Datasets Merged`);
    console.log(`================================`);
    console.log(`Total Combined Records: ${mergedRecords.length}`);
  } catch (err) {
    console.error("Failed to write merged output file:", err);
    process.exit(1);
  }
}

mergeRounds();
