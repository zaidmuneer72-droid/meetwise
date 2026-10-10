
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const meetingRoutes = require("./routes/meetingRoutes");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", meetingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api", commentRoutes);
app.use("/api", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Meetwise backend is running",
  });
});

const uri = process.env.MONGODB_CONNECTION;
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!uri) {
      throw new Error("MONGODB_CONNECTION environment variable is missing");
    }

    await mongoose.connect(uri);

    console.log("Successfully connected to MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Meetwise server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Meetwise backend:", error.message);
    process.exit(1);
  }
}

startServer();
