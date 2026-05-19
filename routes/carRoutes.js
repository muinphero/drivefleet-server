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

    const { search, availability, sort } = req.query;

    const query = {};

    // Search by model or brand
    if (search) {
      query.$or = [
        {
          model: {
            $regex: search,
            $options: "i",
          },
        },

        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Availability filter
    if (availability === "available") {
      query.availability = true;
    }

    const sortOption = {};

    // Price sorting
    if (sort === "asc") {
      sortOption.dailyRentalPrice = 1;
    }

    if (sort === "desc") {
      sortOption.dailyRentalPrice = -1;
    }

    const cars = await carsCollection.find(query).sort(sortOption).toArray();

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

router.get("/owner/:email", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const email = req.params.email;

    const cars = await carsCollection
      .find({
        ownerEmail: email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(cars);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to fetch user cars",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const id = req.params.id;

    const { email } = req.body;

    const car = await carsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    // Ownership validation
    if (car.ownerEmail !== email) {
      return res.status(403).send({
        message: "Unauthorized action",
      });
    }

    const result = await carsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to delete car",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const id = req.params.id;

    const { email, updatedCar } = req.body;

    const existingCar = await carsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingCar) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    // Ownership validation
    if (existingCar.ownerEmail !== email) {
      return res.status(403).send({
        message: "Unauthorized action",
      });
    }

    const result = await carsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updatedCar,
      },
    );

    res.send(result);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to update car",
    });
  }
});

module.exports = router;
