const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const cutoffRoutes = require("./routes/cutoffRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/cutoffs", cutoffRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "KCET Counselling API Running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});