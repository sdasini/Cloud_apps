const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

const { getDb } = require("../lib/mongo");
const { ObjectId } = require("mongodb");


exports.router = router;
// exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false },
};

/*
 * Route to return a list of businesses.
 */
router.get("/", async function (req, res) {
  // declare collection
  const db = getDb();
  const collection = db.collection("businesses");
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
  // page = page > lastPage ? lastPage : page;
  // page = page < 1 ? 1 : page;

  /*
   * Calculate starting and ending indices of businesses on requested page and
   * slice out the corresponsing sub-array of busibesses.
   */
  // const start = (page - 1) * numPerPage;
  // const end = start + numPerPage;
  // const pageBusinesses = businesses.slice(start, end);

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  // const links = {};
  // if (page < lastPage) {
  //   links.nextPage = `/businesses?page=${page + 1}`;
  //   links.lastPage = `/businesses?page=${lastPage}`;
  // }
  // if (page > 1) {
  //   links.prevPage = `/businesses?page=${page - 1}`;
  //   links.firstPage = "/businesses?page=1";
  // }

  /*
   * Construct and send response.
   */
  res.status(200).json({
    businesses: results,
  });
});

/*
 * Route to create a new business.
 */
router.post("/", async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
    const db = getDb();
    const collection = db.collection("businesses");
    const result = await collection.insertOne(req.body);
    // const business = extractValidFields(req.body, businessSchema);
    // business.id = businesses.length;
    // businesses.push(business);
    res.status(201).json({
      id: result.insertedId,
      // links: {
      //   business: `/businesses/${business.id}`,
      // },
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object",
    });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get("/:businessid", async function (req, res, next) {
  const id = req.params.businessid;
  const db = getDb();
  const collection = db.collection("businesses");

  if (ObjectId.isValid(id)) {
    const results = await collection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "businessid",
            as: "reviews",
          },
        },
        {
          $lookup: {
            from: "photos",
            localField: "_id",
            foreignField: "businessid",
            as: "photos",
          },
        },
      ])
      .toArray();
    if (results.length !== 0) {
      res.status(200).send(results);
    } else {
      res.status(403).json({
        error: "Can't Fetch data for ID",
      });
    }
  } else {
    res.status(400).json({
      error: "Invalid Object ID",
    });
  }

  // const businessid = parseInt(req.params.businessid);
  // if (businesses[businessid]) {
  //   /*
  //    * Find all reviews and photos for the specified business and create a
  //    * new object containing all of the business data, including reviews and
  //    * photos.
  //    */
  //   const business = {
  //     reviews: reviews.filter(
  //       (review) => review && review.businessid === businessid
  //     ),
  //     photos: photos.filter(
  //       (photo) => photo && photo.businessid === businessid
  //     ),
  //   };
  //   Object.assign(business, businesses[businessid]);
  //   res.status(200).json(business);
  // } else {
  //   next();
  // }
});

/*
 * Route to replace data for a business.
 */
router.put("/:businessid", async function (req, res, next) {
  const id = req.params.businessid;
  if (ObjectId.isValid(id)) {
    const db = getDb();
    const collection = db.collection("businesses");
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
    const fields = extractValidFields(req.body, businessSchema);
    console.log(fields.ownerid, results[0].ownerid);
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
 * Route to delete a business.
 */
router.delete("/:businessid", async function (req, res, next) {
  const id = req.params.businessid;
  if (ObjectId.isValid(id)) {
    const db = getDb();
    const collection = db.collection("businesses");
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
