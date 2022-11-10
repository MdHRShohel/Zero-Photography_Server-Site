const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jq8ed0u.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Access Forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const serviceCollection = client
      .db("zeroPhotography")
      .collection("services");
    const reviewCollection = client.db("zeroPhotography").collection("reviews");

    // services at home page
    app.get("/services-home", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(3).sort({ _id: -01 });
      const services = await cursor.toArray();
      res.send(services);
    });
    // all services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ _id: -01 });
      const services = await cursor.toArray();
      res.send(services);
    });
    //single service details
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // reviews
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // add review
    app.post("/add-review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //delete review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // get review by email
    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "Unauthorized access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    //get review by id
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await reviewCollection.findOne(query);
      res.send(service);
    });

    //add service
    app.post("/add-service", async (req, res) => {
      const review = req.body;
      const result = await serviceCollection.insertOne(review);
      res.send(result);
    });

    //update reviews
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const UpdatedReview = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: UpdatedReview.name,
          review: UpdatedReview.review,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10d",
      });
      res.send({ token });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Zero Photography server is running");
});

app.listen(port, () => {
  console.log(`Zero Photography Server is running on port: ${port}`);
});
