const { auth } = require("../auth/auth");

const verifySession = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    req.user = session.user;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = verifySession;
