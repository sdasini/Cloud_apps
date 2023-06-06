const router = require("express").Router();
const { ObjectId } = require("mongodb");
const { getDbReference } = require("../lib/mongo");
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

const { ReviewSchema } = require("../models/review");

// const reviews = require('../data/reviews');

exports.router = router;
// exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */

// Get all the reviews
router.get("/", async function (req, res) {
  // declare collection
  const db = getDbReference();
  const collection = db.collection("reviews");
  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1;
  page = Math.max(1, page);
  const pageSize = 5;
  // const lastPage = Math.ceil(1, page);
  const offset = (page - 1) * pageSize;

  const results = await collection
    .find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  res.status(200).json({
    reviews: results,
  });
});

/*
 * Route to create a new review.
 */
router.post("/", async function (req, res, next) {
  if (validateAgainstSchema(req.body, ReviewSchema)) {
    const review = extractValidFields(req.body, ReviewSchema);
    const db = getDbReference();
    const collection = db.collection("reviews");
    /*
     * Make sure the user is not trying to review the same business twice.
     */
    const userReviewedThisBusinessAlready = await collection
      .find({
        userid: review.userid,
        businessid: review.businessid,
      })
      .toArray();
    if (userReviewedThisBusinessAlready.length >= 1) {
      res.status(403).json({
        error: "User has already posted a review of this business",
      });
    } else {
      const results = await collection.insertOne({
        ...req.body,
        businessid: new ObjectId(req.body.businessid),
      });
      res.status(201).json({
        id: results.insertedId,
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object",
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get("/:reviewID", async function (req, res, next) {
  const id = req.params.reviewID;
  const db = getDbReference();
  const collection = db.collection("reviews");

  if (ObjectId.isValid(id)) {
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
    if (results.length !== 0) {
      res.status(200).send(results[0]);
    } else {
      res.status(400).json({
        error: "Can't Fetch data for ID",
      });
    }
  } else {
    res.status(400).json({
      error: "Invalid ID",
    });
  }
});

/*
 * Route to update a review.
 */
router.put("/:reviewID", async function (req, res, next) {
  const id = req.params.reviewID;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("reviews");
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
    const fields = extractValidFields(req.body, ReviewSchema);
    if (results.length !== 0) {
      const results = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: fields }
      );
      res.status(201).json({
        ModifiedCount: results.modifiedCount,
      });
    } else {
      res.status(403).json({ error: "Cannot find ID. OR Invalid UserID" });
    }
  } else {
    res.status(400).json({
      error: "Invalid Object ID",
    });
  }
});

/*
 * Route to delete a review.
 */
router.delete("/:reviewID", async function (req, res, next) {
  const id = req.params.reviewID;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };
    const results = await collection.deleteOne(query);
    console.log(results);
    if (results.deletedCount === 1) {
      res.status(204).end();
    } else {
      res.status(400).json({
        error: "ID doesn't exists",
      });
    }
  } else {
    res.status(400).json({
      error: "Invalid ID",
    });
  }
});
