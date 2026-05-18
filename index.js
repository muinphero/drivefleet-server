const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DriveFleet server running!");
});

app.listen(port, () => {
  console.log(`DriveFleet server running on port ${port}`);
});
