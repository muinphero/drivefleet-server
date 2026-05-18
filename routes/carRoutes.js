const express = require("express");

const router = express.Router();

const { db } = require("../config/db");

router.post("/", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const carData = req.body;

    const result = await carsCollection.insertOne(carData);

    res.status(201).send({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to add car",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const cars = await carsCollection.find().sort({ createdAt: -1 }).toArray();

    res.send(cars);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to fetch cars",
    });
  }
});

module.exports = router;
