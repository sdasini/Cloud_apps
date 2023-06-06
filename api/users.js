const router = require("express").Router();

exports.router = router;
const { getDbReference } = require("../lib/mongo");
const { ReviewSchema } = require("../models/review");
const { UserSchema, insertNewUser } = require("../models/user");
const {validateAgainstSchema, extractValidFields} = require("../lib/validation");
const { ObjectId } = require("mongodb");

router.get("/", async function (req, res, next) {
  try {
    const db = getDbReference();
    const collection = db.collection("users");

    const user = await collection.find()
    .toArray();
    if (user) {
      res.status(200).json(user);
    } else {
      next();
    }
  } catch (err) {
    if (err) {
      return res.status(400).send({ err: err.message });
    } else {
      next(err);
    }
  }
  // } else {
  //   res.status(403).send({
  //     err: "Unauthorized to access the specified resource",
  //   });
  // }
});

router.get("/:userID", async function (req, res, next) {
  const id = req.params.userID;
  const db = getDbReference();
  const collection = db.collection("users");

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
 * Route to list all of a user's businesses.
 */
router.get("/:userid/businesses", async function (req, res) {
  const userid = parseInt(req.params.userid);
  const db = getDbReference();
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
  const db = getDbReference();
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
  const db = getDbReference();
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

// POSTS
router.post("/", async (req, res, next) => {
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {

      const id = await insertNewUser(req.body);
      res.status(201).send({
        id: id,
      });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid business object.",
    });
  }
});

/*
 * Route to modify data.
 */
router.put("/:userID", async function (req, res, next) {
  const id = req.params.userID;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("users");
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
      const fields = extractValidFields(req.body, UserSchema);
      // console.log(fields.ownerid, results[0].ownerid);
      if (results.length !== 0 && fields.ownerid === results[0].ownerid) {
        const results = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: fields }
        );
        res.status(201).json({
          ModifiedCount: results.modifiedCount,
        });
      } else {
        res.status(403).json({ error: "Cannot find ID. OR Invalid OwnerID" });
      }
  } else {
    res.status(400).json({
      error: "Invalid Object ID",
    });
  }
});
/*
 * Route to delete a user.
 */
router.delete("/:userID", async function (req, res, next) {
  const id = req.params.userID;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("users");
    const query = { _id: new ObjectId(id) };
    const results = await collection.deleteOne(query);
    // console.log(results);
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