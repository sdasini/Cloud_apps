const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");
const multer = require("multer"); //to accept multipart form data.
const crypto = require("node:crypto"); //generate random bytes.
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  saveImageInfo,
  saveImageFile,
  getImageDownloadStreamByFilename,
} = require("../models/photo");

const { getDbReference } = require("../lib/mongo");
const { ObjectId } = require("mongodb");

exports.router = router;

router.get("/", async function (req, res) {
  // declare collection
  const db = getDbReference();
  const collection = db.collection("photos");
  const count = await collection.countDocuments();
  page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const results = await collection
    .find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();
  res.status(200).json({
    photos: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count,
  });
});
/*
 * Route to create a new photo.
 */
router.post("/", async function (req, res, next) {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    const db = getDbReference();
    const collection = db.collection("photos");
    const result = await collection.insertOne({
      ...req.body,
      businessid: new ObjectId(req.body.businessid),
    });

    res.status(201).json({
      id: result.insertedId,
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object",
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get("/:photoID", async function (req, res, next) {
  const id = req.params.photoID;
  const db = getDbReference();
  const collection = db.collection("photos");

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
      error: "Invalid Object ID",
    });
  }
});

/*
 * Route to update a photo.
 */
router.put("/:photoID", async function (req, res, next) {
  const id = req.params.photoID;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("photos");
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
    const fields = extractValidFields(req.body, PhotoSchema);

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
 * Route to delete a photo.
 */
router.delete("/:photoID", async function (req, res, next) {
  const id = req.params.photoID;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("photos");
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
