const express = require("express");

const { ObjectId } = require("mongodb");

const router = express.Router();

const { db } = require("../config/db");

// CREATE BOOKING
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

    // Prevent owner booking own car
    if (car.ownerEmail === bookingData.userEmail) {
      return res.status(400).send({
        message: "You cannot book your own car",
      });
    }

    // Prevent duplicate booking
    const existingBooking = await bookingsCollection.findOne({
      carId: bookingData.carId,

      userEmail: bookingData.userEmail,
    });

    if (existingBooking) {
      return res.status(400).send({
        message: "You already booked this car",
      });
    }

    const result = await bookingsCollection.insertOne(bookingData);

    // Increment booking count
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

// GET USER BOOKINGS
router.get("/user/:email", async (req, res) => {
  try {
    const bookingsCollection = db.collection("bookings");

    const email = req.params.email;

    const bookings = await bookingsCollection
      .find({
        userEmail: email,
      })
      .sort({
        bookingDate: -1,
      })
      .toArray();

    res.send(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to fetch bookings",
    });
  }
});

// CANCEL BOOKING
router.delete("/:id", async (req, res) => {
  try {
    const bookingsCollection = db.collection("bookings");

    const carsCollection = db.collection("cars");

    const { email } = req.body;

    const id = req.params.id;

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).send({
        message: "Booking not found",
      });
    }

    if (booking.userEmail !== email) {
      return res.status(403).send({
        message: "Unauthorized action",
      });
    }

    await bookingsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    // Decrement booking count
    await carsCollection.updateOne(
      {
        _id: new ObjectId(booking.carId),
      },
      {
        $inc: {
          bookingCount: -1,
        },
      },
    );

    res.send({
      success: true,

      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to cancel booking",
    });
  }
});

module.exports = router;
