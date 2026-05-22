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

const jwtRoutes = require("./routes/jwtRoutes");

const app = express();

const port = process.env.PORT || 5001;

const allowedOrigins = process.env.CLIENT_ORIGIN.split(",").map((v) =>
  v.trim(),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);

        return;
      }

      callback(Error(`Origin blocked: ${origin}`));
    },

    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/auth/jwt", jwtRoutes);

app.use("/api/cars", carRoutes);

app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("DriveFleet server running");
});

async function startServer() {
  try {
    await client.connect();

    console.log("MongoDB connected");

    console.log(allowedOrigins);

    app.listen(port, () => {
      console.log(`Running on ${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

startServer();
