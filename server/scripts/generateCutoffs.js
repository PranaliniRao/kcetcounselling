const fs = require("fs");
const path = require("path");
const cleanBranch = require("../src/utils/cleanBranch");


// Default category mappings for safety fallbacks
const defaultR1Categories = [
  "1G", "1K", "1R",
  "2AG", "2AK", "2AR",
  "2BG", "2BK", "2BR",
  "3AG", "3AK", "3AR",
  "3BG", "3BK", "3BR",
  "GM", "GMK", "GMR",
  "SCG", "SCK", "SCR",
  "STG", "STK", "STR"
];

const defaultR2R3Categories = [
  "1G", "1K", "1R",
  "2AG", "2AK", "2AR",
  "2BG", "2BK", "2BR",
  "3AG", "3AK", "3AR",
  "3BG", "3BK", "3BR",
  "GM", "GMK", "GMP", "GMR",
  "NRI", "OPN", "OTH",
  "SCG", "SCK", "SCR",
  "STG", "STK", "STR"
];

// Document header/footer lines that should be ignored during parsing
const ignoredLines = [
  "Non-Interactive Admission System",
  "UGCET-",
  "Seat Type:",
  "KARNATAKA EXAMINATIONS AUTHORITY",
  "Course Name",
  "College:",
  "Generated on:"
];

/**
 * Checks if a line in the text is document boilerplate or metadata that should be ignored.
 */
function shouldIgnoreLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (ignoredLines.some(ignored => trimmed.startsWith(ignored))) return true;
  if (/^-- \d+ of \d+ --$/.test(trimmed)) return true;
  return false;
}

/**
 * Main parsing function to extract cutoff data from the text format.
 */
function parseText(text, round) {
  // Split the text into blocks for each college
  const colleges = text
    .split("College:")
    .map(item => item.trim())
    .filter(item => item.startsWith("E"));

  const allRecords = [];
  const expectedCount = round === "R1" ? 24 : 28;
  const defaultCategories = round === "R1" ? defaultR1Categories : defaultR2R3Categories;

  console.log(`Found ${colleges.length} colleges in raw text`);

  for (const collegeBlock of colleges) {
    const rawLines = collegeBlock.split("\n").map(l => l.trim()).filter(l => l);
    if (rawLines.length === 0) continue;

    // First line contains college code and name
    const firstLine = rawLines[0];
    const match = firstLine.match(/^(E\d+)\s+(.*)$/);
    if (!match) continue;

    const collegeCode = match[1];
    const collegeName = match[2];

    // Find the header line to dynamically extract categories
    const headerLine = rawLines.find(line => line.startsWith("Course Name"));
    let categories = [...defaultCategories];
    if (headerLine) {
      const parsedCats = headerLine.split(/\s+/).slice(2);
      if (parsedCats.length === expectedCount) {
        categories = parsedCats;
      }
    }

    const cleanLines = [];
    for (let i = 1; i < rawLines.length; i++) {
      let line = rawLines[i];
      if (shouldIgnoreLine(line)) continue;

      // Check if next line starts with a numeric part of a float value split by a page break/newline
      if (i < rawLines.length - 1) {
        let nextLine = rawLines[i + 1];
        let nextIdx = i + 1;
        while (nextLine && shouldIgnoreLine(nextLine)) {
          nextIdx++;
          nextLine = rawLines[nextIdx];
        }

        if (nextLine) {
          const endsWithDigitOrDot = /[\d.]$/.test(line);
          const nextStartsWithDigit = /^\d+/.test(nextLine);

          if (endsWithDigitOrDot && nextStartsWithDigit) {
            const currentTokens = line.split(/\s+/);
            const nextTokens = nextLine.split(/\s+/);
            const lastToken = currentTokens[currentTokens.length - 1];
            const firstToken = nextTokens[0];

            // Confirm both look like numeric strings before merging
            if (/^[\d.]+$/.test(lastToken) && /^[\d.]+$/.test(firstToken)) {
              currentTokens[currentTokens.length - 1] = lastToken + firstToken;
              nextTokens.shift();
              line = currentTokens.join(" ");
              rawLines[nextIdx] = nextTokens.join(" ");
            }
          }
        }
      }

      if (line.trim()) {
        cleanLines.push(line.trim());
      }
    }

    // Flatten lines into tokens to build branches and cutoff values
    const tokens = cleanLines.join(" ").split(/\s+/).filter(t => t);
    
    const parsedBranches = [];
    let currentBranchName = [];
    let currentCutoffs = [];

    for (const token of tokens) {
      const isValueToken = token === "--" || /^[0-9.-]+$/.test(token);
      if (isValueToken) {
        if (currentBranchName.length > 0) {
          currentCutoffs.push(token);
        }
      } else {
        if (currentCutoffs.length > 0) {
          parsedBranches.push({
            branch: currentBranchName.join(" "),
            cutoffs: currentCutoffs
          });
          currentBranchName = [token];
          currentCutoffs = [];
        } else {
          currentBranchName.push(token);
        }
      }
    }

    // Push the final branch if any
    if (currentBranchName.length > 0 && currentCutoffs.length > 0) {
      parsedBranches.push({
        branch: currentBranchName.join(" "),
        cutoffs: currentCutoffs
      });
    }

    // Process parsed branches into cutoff objects
    for (const branchObj of parsedBranches) {
      if (branchObj.cutoffs.length !== expectedCount) {
        // Skip address lines that mistakenly looked like branches, only log genuine anomalies
        if (branchObj.branch.length < 50 && !branchObj.branch.includes(",")) {
          console.warn(`Warning: College ${collegeCode} branch ${branchObj.branch} has ${branchObj.cutoffs.length} cutoffs, expected ${expectedCount}. Skipping.`);
        }
        continue;
      }

      branchObj.cutoffs.forEach((cutoff, index) => {
        const cleaned = cleanBranch(branchObj.branch);
        if (cleaned) {
          allRecords.push({
            collegeCode,
            collegeName,
            branch: cleaned,
            category: categories[index],
            round,
            cutoff
          });
        }
      });
    }
  }

  return allRecords;
}

// CLI parsing
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node scripts/generateCutoffs.js <filePrefix> <roundName>");
  console.error("Example: node scripts/generateCutoffs.js r1 R1");
  process.exit(1);
}

const filePrefix = args[0]; // e.g. "r1"
const round = args[1];      // e.g. "R1"

const inputPath = path.join(__dirname, "..", "data", `${filePrefix}.txt`);
const outputPath = path.join(__dirname, "..", "data", `cutoffs-${filePrefix}.json`);

try {
  console.log(`Reading source file: ${inputPath}...`);
  const text = fs.readFileSync(inputPath, "utf8");

  console.log(`Starting cutoff parsing for round ${round}...`);
  const records = parseText(text, round);

  console.log(`Writing parsed results to: ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));

  console.log(`\n================================`);
  console.log(`Success: Dataset Generated`);
  console.log(`================================`);
  console.log(`Total Records Saved: ${records.length}`);
  console.log(`Sample record:\n`, records[0]);

} catch (err) {
  console.error("Failed to generate cutoffs:", err);
  process.exit(1);
}