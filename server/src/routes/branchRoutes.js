const express = require("express");
const router = express.Router();

const cutoffs = require("../../data/cutoffs-all.json");
const cleanBranch = require("../utils/cleanBranch");

router.get("/", (req, res) => {

  const branches = [
    ...new Set(
      cutoffs.map(item =>
        cleanBranch(item.branch)
      )
    )
  ].sort();

  res.json(branches);
});

module.exports = router;