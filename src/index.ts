import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./config/index";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { Server } from "http";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Q Shop server is running");
});

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
        const productCollection = client.db("Q-shop").collection("products");

        //  Product api -------------------
        app.get("/products", async (req, res) => {
            try {
                const { category, search, sort } = req.query;

                const query: any = {};

                // Filter by category
                if (category) {
                    query.category = category;
                }

                // Search by title, description, or category
                if (search) {
                    const searchRegex = new RegExp(search as string, "i");
                    query.$or = [
                        { title: searchRegex },
                        { description: searchRegex },
                        { category: searchRegex },
                    ];
                }

                // Build sort condition
                let sortCondition: any = {};

                switch (sort) {
                    case "a-z":
                        sortCondition.title = 1;
                        break;
                    case "z-a":
                        sortCondition.title = -1;
                        break;
                    case "low-to-high":
                        sortCondition.price = 1;
                        break;
                    case "high-to-low":
                        sortCondition.price = -1;
                        break;
                    default:
                        break; // No sorting
                }

                const products = await productCollection
                    .find(query)
                    .sort(sortCondition)
                    .toArray();

                res.send(products);
            } catch (error) {
                console.error("Error fetching products:", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
        app.get("/categories", async (req, res) => {
            try {
                const categories = await productCollection
                    .aggregate([
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                category: "$_id",
                                count: 1,
                            },
                        },
                        {
                            $sort: { category: 1 },
                        },
                    ])
                    .toArray();

                res.send(categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const product = await productCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(product);
        });
        app.get("/related-product", async (req, res) => {
            try {
                const { category } = req.query;

                const relatedProducts = await productCollection
                    .find({ category })
                    .toArray();
                res.send(relatedProducts);
            } catch (error) {
                console.error("Error fetching related products:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

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

export default app;
