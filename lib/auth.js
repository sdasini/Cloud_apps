const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { getDbReference } = require("../lib/mongo");

const { ObjectId } = require("mongodb");
require("dotenv").config();

const secretKey = "SuperSecret";

// exports.generateAuthToken = async function (userId) {
//   const user = await User.findByPk(userId, { attributes: ["admin"] });
//   const isAdmin = user.dataValues.admin;
//   const payload = { sub: userId, admin: isAdmin };
//   const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
//   console.log(token);
//   return token;
// };
exports.generateAuthToken = async function(userId){
    const db = getDbReference();
    const collection = db.collection("users");
    const results = await collection.find({
        _id: new ObjectId(userId),
      }).toArray()
    const isAdmin = results[0].admin;
    const payload = { sub: userId, admin: isAdmin };
    const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    return token;
}

exports.requireAuthentication = function (req, res, next) {
//   console.log("presesnt");
  const authHeader = req.get("Authorization") || "";
  const authHeaderParts = authHeader.split(" ");
//   console.log("~ file: auth.js:15 ~ authHeaderParts:", authHeaderParts)
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;
//   console.log(token);
  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    req.admin = payload.admin;

    next();
    // console.log("~ file: auth.js:19 ~ payload:", payload);
  } catch (err) {
    console.error("Error Verifying Token", err);
    res.status(401).send({ err: "Invalid Authorization Token" });
  }
};

exports.isAdmin = function (req, res, next) {
//   console.log("presesnt");
  const authHeader = req.get("Authorization") || "";
  const authHeaderParts = authHeader.split(" ");
  console.log("🚀 ~ file: auth.js:15 ~ authHeaderParts:", authHeaderParts)
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;
  console.log(token);
  if (token == null) {
    req.admin = false;
    next();
  } else {
    try {
      const payload = jwt.verify(token, secretKey);
      req.user = payload.sub;
      req.admin = payload.admin;

      next();
    //   console.log("~ file: auth.js:19 ~ payload:", payload);
    } catch (err) {
    //   console.error("Error Verifying Token", err);
      res.status(401).send({ err: "Invalid Authorization Token" });
    }
  }
};
