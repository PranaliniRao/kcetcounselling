const express = require("express");
const router = express.Router();

const cutoffs = require("../../data/cutoffs-all.json");

router.get("/", (req, res) => {

  const branches = [
    ...new Set(
      cutoffs.map(item => item.branch)
    )
  ];

  branches.sort();

  res.json(branches);

});

module.exports = router;