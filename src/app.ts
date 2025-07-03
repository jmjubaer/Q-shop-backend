import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
    "mongodb+srv://jmjubaer3927:jubaer12islam@cluster0.gcwme.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Q Shop server is running");
});

app.listen(5000, () => {
    console.log(`Server listening on port localhost:${5000}`);
});
export default app;
