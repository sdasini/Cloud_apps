const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

const businesses = require("./data/businesses.json");
const photos = require("./data/photos.json");
const reviews = require("./data/reviews.json");
app.use(express.json());

app.use(function (req, res, next) {
  console.log(" == Request received");
  console.log(" -- Method:", req.method);
  console.log(" -- URL:", req.url);
  next();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Users may get a list of businesses
app.get("/businesses", function (req, res, next) {
  //call back fnc replies when the api hits
  console.log(" -- req.query:", req.query);
  let page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const lastpage = Math.ceil(businesses.length / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastpage ? lastpage : page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const businessPage = businesses.slice(start, end);
  const links = {};

  if (page < lastpage) {
    links.nextPage = `http://localhost:8080/businesses?page=${page + 1}`;
    links.lastpage = `http://localhost:8080/businesses?page=${lastpage}`;
  }
  if (page > 1) {
    links.prevPage = `http://localhost:8080/businesses?page=${page - 1}`;
    links.firsPage = `http://localhost:8080/businesses?page=1`;
  }

  res.status(200).send({
    businesses: businessPage,
    page: page,
    pageSize: pageSize,
    lastpage: lastpage,
    total: businesses.length,
    links: links,
  });
});

// Adding new business.
app.post("/businesses", (req, res, next) => {
  const id = businesses.length;
  console.log(" -- req.body:", req.body);
  if (
    req.body &&
    req.body.name &&
    req.body.address &&
    req.body.city &&
    req.body.state &&
    req.body.zip &&
    req.body.phone &&
    req.body.category &&
    req.body.subcategory
  ) {
    const email = req.body.email ? req.body.email : null;
    const website = req.body.website ? req.body.website : null;
    res.status(201).send({
      id: id,
      ownerid: id,
      name: `${req.body.name}`,
      address: `${req.body.address}`,
      city: `${req.body.city}`,
      state: `${req.body.state}`,
      zip: `${req.body.zip}`,
      phone: `${req.body.phone}`,
      category: `${req.body.category}`,
      subcategory: `${req.body.subcategory}`,
      website: website,
      email: email,
    });
  }

  if (!req.body.name) {
    res.status(400).send({ message: "Missing Business Name" });
  }
  if (!req.body.address) {
    res.status(400).send({ message: "Missing Business street address" });
  }
  if (!req.body.city) {
    res.status(400).send({ message: "Missing Business City" });
  }
  if (!req.body.state) {
    res.status(400).send({ message: "Missing Business State" });
  }
  if (!req.body.zip) {
    res.status(400).send({ message: "Missing Business ZIP code" });
  }
  if (!req.body.phone) {
    res.status(400).send({ message: "Missing Business Phone Number" });
  }
  if (!req.body.category) {
    res.status(400).send({ message: "Missing Business Category" });
  }
  if (!req.body.subcategory) {
    res.status(400).send({ message: "Missing Business Subcategory" });
  }
});

// Users may fetch detailed information about a business
app.get("/businesses/:id", function (req, res, next) {
  console.log(" -- req.params", req.body);
  const { id } = req.params;
  console.log(id);

  photos_detail = photos.filter((photo) => photo.businessid == id);

  //business details
  businesses_detail = businesses.filter((business) => business.id == id);

  //reviews
  reviews_detail = reviews.filter((review) => review.businessid == id);
  let page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const lastpage = Math.ceil(businesses_detail.length / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastpage ? lastpage : page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const businessPage = businesses.slice(start, end);
  const links = {};
  if (page == lastpage) {
    links.Page = "No links as there is only one page.";
  }

  if (page < lastpage) {
    links.nextPage = `http://localhost:8080/businesses?page=${page + 1}`;
    links.lastpage = `http://localhost:8080/businesses?page=${lastpage}`;
  }
  if (page > 1) {
    links.prevPage = `http://localhost:8080/businesses?page=${page - 1}`;
    links.firsPage = `http://localhost:8080/businesses?page=1`;
  }

  if (businesses[id]) {
    res.status(200).send({
      businesses_detail,
      reviews_detail,
      photos_detail,
      page: page,
      pageSize: pageSize,
      lastpage: lastpage,
      total: businesses.length,
      links: links,
    });
  } else {
    next();
  }
});

// Business owners may modify any of the information
app.put("/businesses/:id", function (req, res, next) {
  console.log(" -- req.params", req.body);
  const { id } = req.params;
  console.log(id);
  if (businesses[id]) {
    if (req.body.name) {
      businesses[id].name = req.body.name;
    }
    if (req.body.address) {
      businesses[id].address = req.body.address;
    }
    if (req.body.city) {
      businesses[id].city = req.body.city;
    }
    if (req.body.state) {
      businesses[id].state = req.body.state;
    }
    if (req.body.zip) {
      businesses[id].zip = req.body.zip;
    }
    if (req.body.phone) {
      businesses[id].phone = req.body.phone;
    }
    if (req.body.category) {
      businesses[id].category = req.body.category;
    }
    if (req.body.subcategory) {
      businesses[id].subcategory = req.body.subcategory;
    }
    if (req.body.website) {
      businesses[id].website = req.body.website;
    }
    if (req.body.email) {
      businesses[id].email = req.body.email;
    }
    res.status(200).send(businesses[id]);
  } else {
    next();
  }
});

// Business owners may remove a business
app.delete("/businesses/:id", function (req, res, next) {
  var id = parseInt(req.params.id);

  if (businesses[id]) {
    businesses[id] = null;
    res.status(204).end();
  } else {
    next();
  }
});

app.get("/reviews", function (req, res, next) {
  console.log(" -- req.query:", req.query);
  let page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const lastpage = Math.ceil(reviews.length / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastpage ? lastpage : page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const reviewPage = reviews.slice(start, end);
  const links = {};
  if (page == lastpage) {
    links.Page = "No links as there is only one page.";
  }

  if (page < lastpage) {
    links.nextPage = `http://localhost:8080/reviews?page=${page + 1}`;
    links.lastpage = `http://localhost:8080/reviews?page=${lastpage}`;
  }
  if (page > 1) {
    links.prevPage = `http://localhost:8080/reviews?page=${page - 1}`;
    links.firsPage = `http://localhost:8080/reviews?page=1`;
  }

  res.status(200).send({
    reviews: reviewPage,
    page: page,
    pageSize: pageSize,
    lastpage: lastpage,
    total: reviews.length,
    links: links,
  });
});

// Users may write a review of an existing business
app.post("/reviews", (req, res, next) => {
  console.log(" -- req.body:", req.body);
  const businessLen = businesses.length;
  const reviewLen = reviews.length;
  if (
    req.body &&
    req.body.userid &&
    req.body.businessid &&
    req.body.stars &&
    req.body.dollars
  )
    if (req.body.businessid < businessLen) {
      const review = `${req.body.review}` ? req.body.review : null;
      res.status(201).send({
        id: reviewLen,
        userid: `${req.body.userid}`,
        businessid: `${req.body.businessid}`,
        dollars: `${req.body.dollars}`,
        stars: `${req.body.stars}`,
        review: review,
      });
    }
  if (!req.body.businessid) {
    res.status(400).send({ message: "Missing Business ID" });
  }
  if (!req.body.stars) {
    res.status(400).send({ message: "Missing stars" });
  }
  if (!req.body.dollars) {
    res.status(400).send({ message: "Missing dollars" });
  } else {
    res.status(400).send({ message: "Business doesn't exist" });
  }
});

// Users may modify any review they've written.
app.put("/reviews/:userid/:businessid", function (req, res, next) {
  console.log(" -- req.params", req.body);
  var userid = parseInt(req.params.userid);
  var businessid = parseInt(req.params.businessid);

  idx = reviews.findIndex(function (review) {
    return review.userid == userid && review.businessid == businessid;
  });
  console.log(reviews[idx]);

  if (reviews[idx] != null) {
    reviews[idx].stars = req.body.stars || reviews[idx].stars;
    reviews[idx].dollars = req.body.dollars || reviews[idx].dollars;
    reviews[idx].review = req.body.review || reviews[idx].review;
    res.status(200).send(reviews[idx]);
  } else {
    next();
  }
});

// Users may delete any review they've written.
app.delete("/reviews/:userid/:businessid", function (req, res, next) {
  var userid = parseInt(req.params.userid);
  var businessid = parseInt(req.params.businessid);

  idx = reviews.findIndex(function (review) {
    return review.userid == userid && review.businessid == businessid;
  });
  if (reviews[idx]) {
    reviews[idx] = null;
    res.status(204).end();
  } else {
    next();
  }
});

app.get("/photos", function (req, res, next) {
  let page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const lastpage = Math.ceil(photos.length / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastpage ? lastpage : page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const photosPage = photos.slice(start, end);
  const links = {};
  if (page == lastpage) {
    links.Page = "No links as there is only one page.";
  }

  if (page < lastpage) {
    links.nextPage = `http://localhost:8080/photos?page=${page + 1}`;
    links.lastpage = `http://localhost:8080/photos?page=${lastpage}`;
  }
  if (page > 1) {
    links.prevPage = `http://localhost:8080/photos?page=${page - 1}`;
    links.firsPage = `http://localhost:8080/photos?page=1`;
  }

  res.status(200).send({
    photos: photosPage,
    page: page,
    pageSize: pageSize,
    lastpage: lastpage,
    total: photos.length,
    links: links,
  });
});

// Users may upload image files containing photos of an existing business
app.post("/photos/:userid/:businessid", (req, res, next) => {
  console.log(" -- req.body:", req.body);
  const photosLen = photos.length;
  const businessLen = businesses.length;
  var userid = parseInt(req.params.userid);
  var businessid = parseInt(req.params.businessid);

  if (req.body && businessid < businessLen) {
    const caption = `${req.body.review}` ? req.body.review : null;
    res.status(201).send({
      id: photosLen,
      userid: userid,
      businessid: businessid,
      caption: caption,
    });
  } else {
    res.status(400).send({ message: "Business/UserID doesn't exist" });
  }
});

// Users may modify any review they've written.
app.put("/photos/:userid/:businessid", function (req, res, next) {
  console.log(" -- req.params", req.body);
  var userid = parseInt(req.params.userid);
  var businessid = parseInt(req.params.businessid);

  idx = photos.findIndex(function (photo) {
    return photo.userid == userid && photo.businessid == businessid;
  });
  console.log(photos[idx]);

  if (photos[idx] != null) {
    photos[idx].caption = req.body.caption || reviews[idx].caption;
    res.status(200).send(photos[idx]);
  } else {
    res.status(404).send({ err: `Missing UserID/ BusinessID` });
  }
});

// Users may delete any review they've written.
app.delete("/photos/:userid/:businessid", function (req, res, next) {
  var userid = parseInt(req.params.userid);
  var businessid = parseInt(req.params.businessid);

  idx = photos.findIndex(function (photos) {
    return photos.userid == userid && photos.businessid == businessid;
  });
  if (photos[idx]) {
    photos[idx] = null;
    res.status(204).end();
  } else {
    next();
  }
});

// Users may list all of the businesses they own.
app.get("/businesses/user/:ownerid", function (req, res, next) {
  console.log(" -- req.params", req.body);
  var ownerid = parseInt(req.params.ownerid);

  idx = businesses.findIndex(function (business) {
    return business.ownerid == ownerid;
  });
  console.log(idx);
  if (businesses[idx] != null) {
    res.status(200).send(businesses[idx]);
  } else {
    res.status(400).send({ message: "UserID doesn't exist" });
  }
});

// Users may list all of the reviews they've written.
app.get("/reviews/user/:userid", function (req, res, next) {
  console.log(" -- req.params", req.body);
  var userid = parseInt(req.params.userid);

  idx = reviews.findIndex(function (review) {
    return review.userid == userid;
  });
  console.log(idx);
  if (reviews[idx] != null) {
    res.status(200).send(reviews[idx]);
  } else {
    res.status(400).send({ message: "UserID doesn't exist" });
  }
});

//   Users may list all of the photos they've uploaded.
app.get("/photos/user/:userid", function (req, res, next) {
  console.log(" -- req.params", req.body);
  var userid = parseInt(req.params.userid);

  idx = photos.findIndex(function (photo) {
    return photo.userid == userid;
  });

  if (photos[idx] != null) {
    res.status(200).send(photos[idx]);
  } else {
    res.status(400).send({ message: "UserID doesn't exist" });
  }
});

app.use("*", function (req, res, next) {
  res.status(404).send({
    err: `Requested URL doesn't exist: ${req.originalUrl}`,
  });
});
