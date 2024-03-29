const express = require("express");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error");
const auth = require("./routes/auth");
const product = require("./routes/product");

const cors = require('cors');
const app = express();

app.use(cors({
  // origin: 'http://localhost:3000', 
    origin: ['http://localhost:3000','http://localhost:3001'], 
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use("/api/v1", auth);
app.use("/api/v1", product);

app.use(errorMiddleware);

module.exports = app;