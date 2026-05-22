const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const { db } = require("../config/db");

const verifySession = require("../middlewares/verifySession");

function escapeRegex(v) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/", verifySession, async (req, res) => {
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

router.get("/:id", async (req, res) => {
try {
const { id } = req.params;
if (!ObjectId.isValid(id)) {
return res.status(400).send({ message: "Invalid ID" });
}
const car = await db.collection("cars").findOne({
_id: new ObjectId(id),
});
if (!car) {
return res.status(404).send({ message: "Car not found" });
}
res.send(car);
} catch (error) {
console.error(error);
res.status(500).send({ message: "Failed to load car" });
}
});

router.get("/owner/:email", verifySession, async (req, res) => {
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



router.patch("/:id", verifySession, async (req, res) => {
try {

const id = req.params.id;

if (!ObjectId.isValid(id)) {
return res.status(400).send({
message:"Invalid ID",
});
}

const existing =
await db.collection("cars").findOne({
_id:new ObjectId(id),
});

if (!existing) {
return res.status(404).send({
message:"Car not found",
});
}

if (
existing.ownerEmail !==
req.user.email
){
return res.status(403).send({
message:"Forbidden",
});
}

await db.collection("cars")
.updateOne(
{
_id:
new ObjectId(id),
},
{
$set:
req.body.updatedCar,
},
);

res.send({
success:true,
});

}catch{

res.status(500).send({
message:"Update failed",
});

}
});


router.delete("/:id", verifySession, async (req, res) => {
try {

const id =
req.params.id;

if (!ObjectId.isValid(id)) {
return res.status(400).send({
message:"Invalid ID",
});
}

const existing =
await db.collection("cars").findOne({
_id:
new ObjectId(id),
});

if (!existing) {
return res.status(404).send({
message:"Car not found",
});
}

if (
existing.ownerEmail !==
req.user.email
){
return res.status(403).send({
message:"Forbidden",
});
}

await db.collection("cars")
.deleteOne({
_id:
new ObjectId(id),
});

res.send({
success:true,
});

}catch{

res.status(500).send({
message:"Delete failed",
});

}
});

module.exports = router;
