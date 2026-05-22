const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const { db } = require("../config/db");

const verifyJWT = require("../middlewares/verifyJWT");

function escapeRegex(v) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/", verifyJWT, async (req, res) => {
  try {
    const car = {
      ...req.body,
      ownerEmail: req.user.email,
      createdAt: new Date(),
      bookingCount: 0,
    };

    const result = await db.collection("cars").insertOne(car);

    res.status(201).send(result);
  } catch {
    res.status(500).send({
      message: "Failed",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, vehicleType, availability, sort } = req.query;

    const query = {};

    if (search) {
      const safe = escapeRegex(search);

      query.$or = [
        {
          brand: {
            $regex: safe,
            $options: "i",
          },
        },

        {
          model: {
            $regex: safe,
            $options: "i",
          },
        },
      ];
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (availability === "available") {
      query.availability = true;
    }

    const sortObj = {};

    if (sort === "asc") sortObj.dailyRentalPrice = 1;

    if (sort === "desc") sortObj.dailyRentalPrice = -1;

    const cars = await db
      .collection("cars")
      .find(query)
      .sort(sortObj)
      .toArray();

    res.send(cars);
  } catch {
    res.status(500).send({
      message: "Failed",
    });
  }
});

router.get("/owner/:email", verifyJWT, async (req, res) => {
  if (req.user.email !== req.params.email) {
    return res.status(403).send({
      message: "Forbidden",
    });
  }

  const cars = await db
    .collection("cars")
    .find({
      ownerEmail: req.user.email,
    })
    .toArray();

  res.send(cars);
});

module.exports = router;
