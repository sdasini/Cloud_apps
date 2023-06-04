const router = require("express").Router();

exports.router = router;
const { getDb } = require("../lib/mongo");

/*
 * Route to list all of a user's businesses.
 */
router.get("/:userid/businesses", async function (req, res) {
  const userid = parseInt(req.params.userid);
  const db = getDb();
  const collection = db.collection("businesses");
  const results = await collection
    .find({
      ownerid: userid,
    })
    .toArray();
  if (results.length !== 0) {
    res.status(200).send(results);
  } else {
    res.status(400).json({
      error: "User doesn't exist. Request a valid userID",
    });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get("/:userid/reviews", async function (req, res) {
  const userid = parseInt(req.params.userid);
  const db = getDb();
  const collection = db.collection("reviews");
  const results = await collection
    .find({
      userid: userid,
    })
    .toArray();
  if (results.length !== 0) {
    res.status(200).send(results);
  } else {
    res.status(400).json({
      error: "User doesn't exist. Request a valid userID",
    });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get("/:userid/photos", async function (req, res) {
  const userid = parseInt(req.params.userid);
  const db = getDb();
  const collection = db.collection("photos");
  const results = await collection
    .find({
      userid: userid,
    })
    .toArray();
  if (results.length !== 0) {
    res.status(200).send(results);
  } else {
    res.status(400).json({
      error: "User doesn't exist. Request a valid userID",
    });
  }
});
