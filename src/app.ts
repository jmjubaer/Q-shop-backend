import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./config/index";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Q Shop server is running");
});


export default app;
