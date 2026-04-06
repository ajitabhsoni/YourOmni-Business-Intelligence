require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/datasets", require("./routes/datasetRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/offers", require("./routes/offerRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Youromni AI API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started"));

console.log("BREVO KEY =", process.env.BREVO_KEY);