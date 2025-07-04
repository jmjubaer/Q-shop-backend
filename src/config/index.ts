import dotenv from "dotenv";
import path from "path";

dotenv.config();
export default {
    port: process.env.PORT,
    database_uri: process.env.DB_URI,
};
