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

router.get("/:collegeCode", (req, res) => {
  const { collegeCode } = req.params;
  const collegeRecords = cutoffs.filter(item => item.collegeCode === collegeCode);
  
  if (collegeRecords.length === 0) {
    return res.status(404).json({
      message: "College not found"
    });
  }

  const collegeName = collegeRecords[0].collegeName;
  res.json({
    collegeCode,
    collegeName,
    records: collegeRecords
  });
});

module.exports = router;