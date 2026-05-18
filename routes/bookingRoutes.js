const express = require("express");

const { ObjectId } = require("mongodb");

const router = express.Router();

const { db } = require("../config/db");

router.post("/", async (req, res) => {
  try {
    const bookingsCollection = db.collection("bookings");

    const carsCollection = db.collection("cars");

    const bookingData = req.body;

    const car = await carsCollection.findOne({
      _id: new ObjectId(bookingData.carId),
    });

    if (!car) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    if (car.ownerEmail === bookingData.userEmail) {
      return res.status(400).send({
        message: "You cannot book your own car",
      });
    }

    const result = await bookingsCollection.insertOne(bookingData);

    await carsCollection.updateOne(
      {
        _id: new ObjectId(bookingData.carId),
      },
      {
        $inc: {
          bookingCount: 1,
        },
      },
    );

    res.status(201).send({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to book car",
    });
  }
});

module.exports = router;
