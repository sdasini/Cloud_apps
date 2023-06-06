const { ObjectId } = require("mongodb");

const { getDbReference } = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");
const bcrypt = require("bcryptjs");

const UserSchema = {
  name: { required: true },
  email: { required: true, unique: true },
  password: {
    required: true,
    // set(value) {
    //   this.setDataValue("password", bcrypt.hashSync(value, 8));
    // },
  },
};
exports.UserSchema = UserSchema;

async function insertNewUser(user) {
  user = extractValidFields(user, UserSchema);
  if (user.admin == null) {
    user.admin = false;
  }
  user.password = hashPassword(user.password);
  console.log(user);
  const db = getDbReference();
  const collection = db.collection("users");
  const result = await collection.insertOne(user);
  return result.insertedId;
}
exports.insertNewUser = insertNewUser;

function hashPassword(password) {
  return bcrypt.hashSync(password, 8);
}

async function getUserById(id) {
  const db = getDbReference();
  const collection = db.collection("users");
  if (ObjectId.isValid(id)) {
    const results = await collection
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
      // console.log(results)
    if (!results) {
      return null;
    } else {
      return results;
    }
  }
}
exports.getUserById = getUserById;

exports.validateUser = async function validateUser(id, password) {
  const user = await getUserById(id);
  console.log(user)
  console.log(
    "~ file: user.js:48 ~ validateUser ~ user.password:",
    user[0].password
  );
  // temp_pass = bcrpyt.hashSync(password, 8);

  // console.log(typeof user[0].password);
  return user && (await bcrypt.compare(password, user[0].password));
};

async function bulkInsertNewUsers(users) {
  const usersToInsert = users.map(function (user) {
    return extractValidFields(user, userSchema);
  });
  usersToInsert.admin = false;
  usersToInsert.password = hashPassword(user.password);
  const db = getDbReference();
  const collection = db.collection("users");
  const result = await collection.insertMany(usersToInsert);
  return result.insertedIds;
}
exports.bulkInsertNewUsers = bulkInsertNewUsers;
