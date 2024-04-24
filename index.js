require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8urwnno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>> COLLECTION <<<<<<<<<<<<<<<<<<<<<<<<<<<

    const usersCollection = client.db("Tasker-Job").collection("users");
    const applicationCollection = client
      .db("Tasker-Job")
      .collection("application");

    // ============================= USER ================================

    // Users related api
    app.get("/users", async (req, res) => {
      const user = req.query.email;
      const query = {};
      if (user) {
        query.email = user;
      }

      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = {
        email: user.email,
      };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "user already exist",
          insertedId: null,
        });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // =========================== Task APPLICATION ==============================

    // post method for application
    app.post("/application", async (req, res) => {
      const application = req.body;
      const result = await applicationCollection.insertOne(application);
      res.send(result);
    });

    // get method for application
    app.get("/application", async (req, res) => {
      const result = await applicationCollection.find().toArray();
      res.send(result);
    });

    //  update
    app.put("/application/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      // console.log(updateOrder);

      const filter = { _id: new ObjectId(id) };
      const orderUpdate = {
        $set: {
          title: updateOrder?.title,
          description: updateOrder?.description,
          tags: updateOrder?.tags,
          priority: updateOrder?.priority,
        },
      };

      const result = await applicationCollection.updateOne(filter, orderUpdate);
      res.send(result);
    });

    // Delete application
    app.delete("/application/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await applicationCollection.deleteOne(query);
      res.send(result);
    });

    // patch method for status
    app.patch("/application/status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "complete",
        },
      };
      const result = await applicationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // patch method for favorite
    app.patch("/application/favorite/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          favorite: updateOrder.favorite,
        },
      };
      const result = await applicationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // +++++++++++++++++++++++++++ THE END ++++++++++++++++++++++++++++

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the Improved Tasker Server!");
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
