const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, id } = req.body;

    if (!email || !id) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }

    const token = jwt.sign({ email, id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("drivefleet_token", token, {
      httpOnly: true,

      secure: true,

      sameSite: "none",

      maxAge: 604800000,
    });

    res.send({
      success: true,
    });
  } catch {
    res.status(500).send({
      message: "Login failed",
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("drivefleet_token", {
    httpOnly: true,

    secure: true,

    sameSite: "none",
  });

  res.send({
    success: true,
  });
});

module.exports = router;
