const express = require("express");

const { ObjectId } = require("mongodb");

const router = express.Router();

const { db } = require("../config/db");

// const verifySession = require("../middlewares/verifySession");
const verifySession = require("../middlewares/verifyJWT");

// ADD CAR
router.post("/", verifySession, async (req, res) => {
  try {
    const result = await db.collection("cars").insertOne(req.body);

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

    const { search, availability, vehicleType, sort } = req.query;

    const query = {};

    // SEARCH BY CAR NAME
    if (search && search.trim()) {
      const value = search.trim();

      query.$or = [
        {
          brand: {
            $regex: value,
            $options: "i",
          },
        },

        {
          model: {
            $regex: value,
            $options: "i",
          },
        },

        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$brand", " ", "$model"],
              },

              regex: value,

              options: "i",
            },
          },
        },
      ];
    }

    // CAR TYPE
    if (vehicleType && vehicleType.trim()) {
      query.vehicleType = {
        $regex: `^${vehicleType}`,

        $options: "i",
      };
    }

    // AVAILABLE
    if (availability === "available") {
      query.availability = true;
    }

    const sortOption = {};

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

// OWNER CARS
router.get("/owner/:email", async (req, res) => {
  try {
    const cars = await db
      .collection("cars")
      .find({
        ownerEmail: req.params.email,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.send(cars);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch user cars",
    });
  }
});

// SINGLE CAR
router.get("/:id", async (req, res) => {
  try {
    const car = await db.collection("cars").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!car) {
      return res.status(404).send({
        message: "Car not found",
      });
    }

    res.send(car);
  } catch {
    res.status(500).send({
      message: "Failed to fetch car",
    });
  }
});

// DELETE
router.delete("/:id", verifySession, async (req, res) => {
  try {
    const result = await db.collection("cars").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed to delete",
    });
  }
});

// UPDATE
router.patch("/:id", verifySession, async (req, res) => {
  try {
    const result = await db.collection("cars").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: req.body.updatedCar,
      },
    );

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed to update",
    });
  }
});

module.exports = router;
