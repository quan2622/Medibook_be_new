import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from "./routes/web";
import connectDB from "./config/connectDB";
import cors from 'cors'

require("dotenv").config();

let app = express();
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

initWebRoutes(app);

connectDB();

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
