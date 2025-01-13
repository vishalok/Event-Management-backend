const Event = require("../models/Event");

//fetch all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("attendees", "name email");
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch a single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("attendees", "name email");
    if (!event) throw new Error("Event not found");
    res.status(200).json(event);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


//create new event
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    req.io.emit("eventCreated", event); // Emit a real-time event
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) throw new Error("Event not found");

    // Check ownership
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    req.io.emit("eventUpdated", updatedEvent); // Emit a real-time event
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) throw new Error("Event not found");

    // Check ownership
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Event.findByIdAndDelete(event._id);
    req.io.emit("eventDeleted", id); // Emit a real-time event
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Attend an event
exports.attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw new Error("Event not found");

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
      req.io.emit("attendeeUpdated", { eventId: event._id, attendees: event.attendees });
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};