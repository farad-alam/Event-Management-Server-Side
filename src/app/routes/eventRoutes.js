const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const router = express.Router();

//Create a new event

router.post('/', async (req, res) => {
  try {
    const { title, name, userId, date, time, location, description, } = req.body;
    console.log(req.body);
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Create new event
    const event = new Event({
      title,
      name,
      userId,
      date,
      time,
      location,
      description,
      
    });

    await event.save();

    // Populate user details
    await event.populate('userId', 'name email');
    await event.populate('attendees', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event: event.toJSON()
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation Error', 
        message : messages 
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
});

//Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("userId", "name email photoURL")
      // .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.json({
      message: 'Events retrieved successfully',
      count: events.length,
      events
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
});


//Get all events by user Id
router.get("/userid/:userid", async (req, res) => {
  const {userid} = req.params
  try {
    const events = await Event.find({ userId: userid })
      .populate("userId", "name email photoURL")
      // .populate("attendees", "name email")
      .sort({ date: 1 });
    // console.log(events);
    res.json({
      message: "Events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
      message: error.message,
    });
  }
});


// Get event by ID

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }

    res.json({
      message: 'Event retrieved successfully',
      event: event.toJSON()
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid event ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const { title, name, date, time, location, description, attendees } = req.body;

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }

    // Update fields
    if (title) event.title = title;
    if (name) event.name = name;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (description) event.description = description;
    if (attendees) event.attendees = attendees;

    await event.save();

    // Populate user details
    await event.populate('userId', 'name email');
    await event.populate('attendees', 'name email');

    res.json({
      success:true,
      message: 'Event updated successfully',
      event: event.toJSON()
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation Error', 
        messages 
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
});

// Delete event

router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success:true,
      message: 'Event deleted successfully',
      eventId: req.params.id
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid event ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
});

// Add attendee to event

router.post('/:id/attendees', async (req, res) => {
  try {
    const { userId } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }

    // Check if user is already an attendee
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ 
        error: 'User is already an attendee' 
      });
    }

    event.attendees.push(userId);
    await event.save();

    await event.populate('userId', 'name email');
    await event.populate('attendees', 'name email');

    res.json({
      message: 'Attendee added successfully',
      event: event.toJSON()
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
});

module.exports = router;