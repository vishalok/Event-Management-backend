const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getEvents); // Fetch all events
router.get("/:id", getEventById); // Fetch a single event
router.post("/", authMiddleware, createEvent); // Create a new event
router.put("/:id", authMiddleware, updateEvent); // Update an event
router.delete("/:id", authMiddleware, deleteEvent); // Delete an event
router.post("/:id/attend", authMiddleware, attendEvent); // Attend an event

module.exports = router;
