const express = require("express");
const router = express.Router();

const cutoffs = require("../../data/cutoffs.json");

router.get("/", (req, res) => {
  res.json(cutoffs);
});

module.exports = router;