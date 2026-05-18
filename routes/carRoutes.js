const express = require("express");
const { ObjectId } = require("mongodb");

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

router.get("/:id", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const id = req.params.id;

    const car = await carsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    res.send(car);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to fetch car",
    });
  }
});

module.exports = router;
