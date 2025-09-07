
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

main()
  .then(async () => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
  });
