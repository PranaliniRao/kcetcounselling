const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const searchRoutes = require("./routes/searchRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const branchRoutes = require("./routes/branchRoutes");

dotenv.config();

const app = express();

const cutoffRoutes = require("./routes/cutoffRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/cutoffs", cutoffRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/branches", branchRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "KCET Counselling API Running"
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});