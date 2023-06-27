const router = require("express").Router();
const {
  validateAgainstSchema,
  extractValidFields,
} = require("../lib/validation");

const { getDbReference } = require("../lib/mongo");
const { ObjectId } = require("mongodb");
const { BusinessSchema, getBusinessById, getBusinessesPage, insertNewBusiness } = require("../models/business");

exports.router = router;

/*
 * Route to return a list of businesses.
 */
router.get("/", async (req, res, next) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const businessPage = await getBusinessesPage(parseInt(req.query.page) || 1);
    businessPage.links = {};
    if (businessPage.page < businessPage.totalPages) {
      businessPage.links.nextPage = `/businesses?page=${businessPage.page + 1}`;
      businessPage.links.lastPage = `/businesses?page=${businessPage.totalPages}`;
    }
    if (businessPage.page > 1) {
      businessPage.links.prevPage = `/businesses?page=${businessPage.page - 1}`;
      businessPage.links.firstPage = "/businesses?page=1";
    }
    res.status(200).send(businessPage);
  } catch (err) {
    next(err);
  }
});

/*
 * Route to create a new business.
 */
router.post("/", async (req, res) => {
  if (validateAgainstSchema(req.body, BusinessSchema)) {
    try {
      const id = await insertNewBusiness(req.body);
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
 * Route to fetch info about a specific business.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const business = await getBusinessById(req.params.id);
    if (business) {
      res.status(200).send(business);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to replace data for a business.
 */
router.put("/:businessid", async function (req, res, next) {
  const id = req.params.businessid;
  if (ObjectId.isValid(id)) {
    const db = getDbReference();
    const collection = db.collection("businesses");
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
      const fields = extractValidFields(req.body, BusinessSchema);
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
    const db = getDbReference();
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
