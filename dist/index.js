"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./config/index"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Q Shop server is running");
});
const client = new mongodb_1.MongoClient(index_1.default.database_uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
let server;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productCollection = client.db("Q-shop").collection("products");
            //  Product api -------------------
            app.get("/products", (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { category, search, sort } = req.query;
                    const query = {};
                    // Filter by category
                    if (category) {
                        query.category = category;
                    }
                    // Search by title, description, or category
                    if (search) {
                        const searchRegex = new RegExp(search, "i");
                        query.$or = [
                            { title: searchRegex },
                            { description: searchRegex },
                            { category: searchRegex },
                        ];
                    }
                    // Build sort condition
                    let sortCondition = {};
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
                    const products = yield productCollection
                        .find(query)
                        .sort(sortCondition)
                        .toArray();
                    res.send(products);
                }
                catch (error) {
                    console.error("Error fetching products:", error);
                    res.status(500).send({ message: "Internal Server Error" });
                }
            }));
            app.get("/categories", (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const categories = yield productCollection
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
                }
                catch (error) {
                    console.error("Error fetching categories:", error);
                    res.status(500).json({ message: "Internal server error" });
                }
            }));
            app.get("/product/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const product = yield productCollection.findOne({
                    _id: new mongodb_1.ObjectId(id),
                });
                res.send(product);
            }));
            app.get("/related-product", (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { category } = req.query;
                    const relatedProducts = yield productCollection
                        .find({ category })
                        .toArray();
                    res.send(relatedProducts);
                }
                catch (error) {
                    console.error("Error fetching related products:", error);
                    res.status(500).json({ message: "Internal server error" });
                }
            }));
            yield client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            // Server run here
            server = app.listen(index_1.default.port, () => {
                console.log(`Server listening on port ${index_1.default.port}`);
            });
        }
        finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
        }
    });
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
exports.default = app;
