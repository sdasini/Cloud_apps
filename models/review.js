const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

const ReviewSchema = {
    userid: { required: true },
    businessid: { required: true },
    dollars: { required: true },
    stars: { required: true },
    review: { required: false },
  };  
exports.ReviewSchema = ReviewSchema;

async function bulkInsertNewReviews(reviews) {
  const reviewsToInsert = reviews.map(function (review) {
    return extractValidFields(review, reviewSchema);
  });
  const db = getDbReference();
  const collection = db.collection("reviews");
  const result = await collection.insertMany(reviewsToInsert);
  return result.insertedIds;
}
exports.bulkInsertNewReviews = bulkInsertNewReviews;
