const express = require("express");

const { ObjectId } = require("mongodb");

const router = express.Router();

const { db } = require("../config/db");

const verifySession = require("../middlewares/verifySession");

// ADD CAR
router.post("/", verifySession, async (req, res) => {
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

// GET ALL CARS
router.get("/", async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const { search, availability, sort } = req.query;

    const query = {};

    // SEARCH
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

    // FILTER AVAILABLE
    if (availability === "available") {
      query.availability = true;
    }

    const sortOption = {};

    // SORT PRICE
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

// GET USER/OWNER CARS
router.get("/owner/:email", verifySession, async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const email = req.params.email;

    const cars = await carsCollection
      .find({
        ownerEmail: email,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.send(cars);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Failed to fetch user cars",
    });
  }
});

// GET SINGLE CAR
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

// DELETE CAR
router.delete("/:id", verifySession, async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const id = req.params.id;

    const email = req.user.email;

    const car = await carsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    // AUTHORIZATION
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

// UPDATE CAR
router.patch("/:id", verifySession, async (req, res) => {
  try {
    const carsCollection = db.collection("cars");

    const id = req.params.id;

    const email = req.user.email;

    const { updatedCar } = req.body;

    const existingCar = await carsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingCar) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    // AUTHORIZATION
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
