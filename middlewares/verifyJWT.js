const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.drivefleet_token;

    if (!token) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).send({
      message: "Invalid session",
    });
  }
};
