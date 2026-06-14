const express = require("express");
const router = express.Router();

const cutoffs = require("../../data/cutoffs-all.json");

router.get("/", (req, res) => {

  const colleges = [
    ...new Map(
      cutoffs.map(item => [
        item.collegeCode,
        {
          collegeCode: item.collegeCode,
          collegeName: item.collegeName
        }
      ])
    ).values()
  ];

  res.json(colleges);

});

module.exports = router;