const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const User = require("./models/User"); // Ensure User model is imported
const bcrypt = require("bcryptjs");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// // Seed Guest User
// const seedGuestUser = async () => {
//   const guestExists = await User.findOne({ email: "guest@example.com" });
//   if (!guestExists) {
//     const hashedPassword = await bcrypt.hash("guest123", 10);
//     await User.create({
//       name: "Guest User",
//       email: "guest@example.com",
//       password: hashedPassword,
//     });
//     console.log("Guest user created");
//   } else {
//     console.log("Guest user already exists");
//   }
// };

// seedGuestUser();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("newEvent", () => {
    socket.broadcast.emit("updateEvents");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
