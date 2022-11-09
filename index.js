const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

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

async function run() {
  try {
    const serviceCollection = client
      .db("zeroPhotography")
      .collection("services");
    const reviewCollection = client.db("zeroPhotography").collection("reviews");

    // services at home page
    app.get("/services-home", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
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
