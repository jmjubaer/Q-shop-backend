import { Server } from "http";
import app from "./app";
import config from "./config";
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(config.database_uri as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
let server: Server;
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        // Server run here
        server = app.listen(config.port, () => {
            console.log(`Server listening on port ${config.port}`);
        });
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);
process.on("unhandledRejection", () => {
    if (server) {
        server.close(() => {
            console.log("Server closed due to unhandled rejection");
            process.exit(1);
        });
    }
});

process.on("uncaughtException", () => {
    console.log("Uncaught exception, shutting down the server");
    process.exit(1);
});
