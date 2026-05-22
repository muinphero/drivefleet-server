const { betterAuth } = require("better-auth");

const { mongodbAdapter } = require("better-auth/adapters/mongodb");

const { db } = require("../config/db");

const trustedOrigins = process.env.CLIENT_ORIGIN.split(",").map((v) =>
  v.trim(),
);

const auth = betterAuth({
  database: mongodbAdapter(db),

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});

module.exports = {
  auth,
};
