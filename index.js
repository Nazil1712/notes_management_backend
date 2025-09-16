const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const taskRouter = require("./routes/Task.router");
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    credentials: true,
  })
);
app.use(express.json());

//Routes
app.use("/api/tasks", taskRouter);

app.get("/",(req,res)=>{
  res.status(200).json({"ok":true})
})

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

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
