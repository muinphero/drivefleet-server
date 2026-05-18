const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const { client } = require("./config/db");
const auth = require("./auth/auth");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

async function run() {
  try {
    await client.connect();

    console.log("MongoDB connected");
  } finally {
  }
}

run().catch(console.dir);

app.use("/api/auth", async (req, res) => {
  return auth.handler(req, res);
});

app.get("/", (req, res) => {
  res.send("DriveFleet server running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
