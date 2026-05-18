const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const cookieParser = require("cookie-parser");

dotenv.config();

const { toNodeHandler } = require("better-auth/node");

const { client } = require("./config/db");

const { auth } = require("./auth/auth");

const carRoutes = require("./routes/carRoutes");

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

const port = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/cars", carRoutes);

app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("DriveFleet server running");
});

async function startServer() {
  try {
    await client.connect();

    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
