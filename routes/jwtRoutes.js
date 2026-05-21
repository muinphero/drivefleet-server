const express = require("express");

const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, id } = req.body;

    if (!email || !id) {
      return res.status(400).send({
        message: "Invalid user",
      });
    }

    const token = jwt.sign(
      {
        email,
        id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    res.cookie(
      "drivefleet_token",

      token,

      {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite: "lax",

        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    res.send({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Token generation failed",
    });
  }
});

router.post(
  "/logout",

  (req, res) => {
    res.clearCookie(
      "drivefleet_token",

      {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite: "lax",
      },
    );

    res.send({
      success: true,
    });
  },
);

module.exports = router;
