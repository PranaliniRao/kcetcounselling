const cutoffs = require("../../data/cutoffs-all.json");

const searchColleges = (req, res) => {
  const {
    category,
    round,
    minRange,
    maxRange
  } = req.query;

  const results = cutoffs.filter(record => {

    const cutoff = Number(record.cutoff);

    if (isNaN(cutoff)) return false;

    return (
      record.category === category &&
      record.round === round &&
      cutoff >= Number(minRange) &&
      cutoff <= Number(maxRange)
    );
  });

  res.json({
    total: results.length,
    results
  });
};

module.exports = {
  searchColleges
};