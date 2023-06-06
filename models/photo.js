const { ObjectId, GridFSBucket } = require('mongodb')
const fs = require("node:fs");

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  businessid: { required: true },
  userid: { required: true},
  caption: { required: false },
};
exports.PhotoSchema = PhotoSchema;

// save file in disk
exports.saveImageInfo = async function (image) {
  const db = getDbReference();
  const collection = db.collection("images");
  const result = await collection.insertOne(image);
  return result.insertedId;
};

// save file in DB.
exports.saveImageFile = async function (photo) {
  return new Promise(function (resolve, reject) {       //building custom promise
    const db = getDbReference();
    const bucket = new GridFSBucket(db, { bucketName: "images" });
    const metadata = {
      contentType: photo.contentType,
      userId: photo.userId,
      caption: photo.caption,
    };
    const uploadStream = bucket.openUploadStream(photo.filename, {
      metadata: metadata,
    });
    fs.createReadStream(photo.path)
      .pipe(uploadStream)
      .on("error", function (err) {
        reject(err);
      })
      .on("finish", function (result) {
        console.log("== write success, result:", result);
        resolve(result._id);
      });
  });
};

async function insertNewPhoto(photo) {
  photo = extractValidFields(photo, PhotoSchema);
  photo.businessId = ObjectId(photo.businessId);
  const db = getDbReference();
  const collection = db.collection("photos");
  const result = await collection.insertOne(photo);
  return result.insertedId;
}
exports.insertNewPhoto = insertNewPhoto;


async function getPhotoById(id) {
  const db = getDbReference();
  //   const collection = db.collection("photos");
  const bucket = new GridFSBucket(db, { bucketName: "images" });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await bucket.find({ _id: new ObjectId(id) }).toArray();
    // const results = await collection.find({ _id: new ObjectId(id) }).toArray();
    return results[0];
  }
}
exports.getPhotoById = getPhotoById;


exports.getImageDownloadStreamByFilename = function (filename) {
    const db = getDbReference()
    const bucket = new GridFSBucket(db, { bucketName: "images" })
    return bucket.openDownloadStreamByName(filename)
}


async function bulkInsertNewPhotos(photos) {
  const photosToInsert = photos.map(function (photo) {
    return extractValidFields(photo, PhotoSchema);
  });
  const db = getDbReference();
  const collection = db.collection("photos");
  const result = await collection.insertMany(photosToInsert);
  return result.insertedIds;
}
exports.bulkInsertNewPhotos = bulkInsertNewPhotos;
