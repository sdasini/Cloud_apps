const { ObjectId } = require("mongodb");

const { getDbReference } = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");

const UserSchema = {
  name: { required: true },
  email: { required: true, unique: true },
  password: {
    required: true,
    set(value) {
      this.setDataValue("password", bcrpyt.hashSync(value, 8));
    },
  },
};
exports.UserSchema = UserSchema;

async function insertNewUser(user) {
  user = extractValidFields(user, UserSchema);
  user.admin = false;
  console.log(user);
  const db = getDbReference();
  const collection = db.collection("users");
  const result = await collection.insertOne(user);
  return result.insertedId;
}
exports.insertNewUser = insertNewUser;

async function bulkInsertNewUsers(users) {
  const usersToInsert = users.map(function (user) {
    return extractValidFields(user, userSchema);
  });
  usersToInsert.admin = false;
  const db = getDbReference();
  const collection = db.collection("users");
  const result = await collection.insertMany(usersToInsert);
  return result.insertedIds;
}
exports.bulkInsertNewUsers = bulkInsertNewUsers;
