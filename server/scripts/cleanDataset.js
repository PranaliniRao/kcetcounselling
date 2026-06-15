const fs = require("fs");
const path = require("path");
const cleanBranch = require("../src/utils/cleanBranch");

const dataDir = path.join(__dirname, "..", "data");
const files = ["cutoffs-r1.json", "cutoffs-r2.json", "cutoffs-r3.json", "cutoffs-all.json"];

console.log("Starting dataset cleaning migration...");

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${file} does not exist at ${filePath}. Skipping.`);
    continue;
  }
  
  console.log(`Reading ${file}...`);
  let data;
  try {
    const rawData = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(rawData);
  } catch (err) {
    console.error(`Error reading/parsing ${file}:`, err);
    continue;
  }
  
  // Clean and deduplicate
  const seenKeys = new Set();
  const cleanedData = [];
  let duplicatesCount = 0;
  
  for (const record of data) {
    const cleanB = cleanBranch(record.branch);
    if (!cleanB) continue; // skip invalid or empty branches
    
    // Create unique key: collegeCode + round + category + cleanBranch
    const key = `${record.collegeCode}-${record.round}-${record.category}-${cleanB}`;
    
    if (seenKeys.has(key)) {
      duplicatesCount++;
      continue;
    }
    
    seenKeys.add(key);
    cleanedData.push({
      ...record,
      branch: cleanB
    });
  }
  
  console.log(`File: ${file}`);
  console.log(`- Original records: ${data.length}`);
  console.log(`- Cleaned records: ${cleanedData.length}`);
  console.log(`- Duplicates removed: ${duplicatesCount}`);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log(`- Successfully wrote cleaned data to ${file}\n`);
  } catch (err) {
    console.error(`Error writing cleaned data for ${file}:`, err);
  }
}

console.log("Dataset cleaning migration completed successfully!");
