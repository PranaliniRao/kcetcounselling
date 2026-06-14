const express = require("express");

const router = express.Router();

const {
  searchColleges
} = require("../controllers/searchController");

router.get("/", searchColleges);

module.exports = router;