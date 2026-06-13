const fs = require("fs");
const { PDFParse } = require("pdf-parse");

/**
 * Extracts text content from a PDF file and saves it to a text file.
 * 
 * @param {string} path - Path to the source PDF file
 * @param {string} output - Path where the extracted text should be saved
 */
async function extractPDF(path, output) {
  console.log(`Extracting text from ${path} to ${output}...`);
  const dataBuffer = fs.readFileSync(path);

  const parser = new PDFParse({ data: dataBuffer });
  try {
    const data = await parser.getText();
    fs.writeFileSync(output, data.text);
    console.log(`Successfully saved text to ${output}`);
  } finally {
    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node scripts/extractText.js <inputPdfPath> <outputTextPath>");
  process.exit(1);
}

const inputPdf = args[0];
const outputTxt = args[1];

extractPDF(inputPdf, outputTxt).catch(err => {
  console.error("Extraction failed:", err);
  process.exit(1);
});