const fs = require("fs");
const path = require("path");

const dataPath = path.join(
  __dirname,
  "../../data/cutoffs-all.json"
);

const cutoffs = JSON.parse(
  fs.readFileSync(dataPath, "utf8")
);

function getAllCutoffs() {
  return cutoffs;
}

module.exports = {
  getAllCutoffs
};