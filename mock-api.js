const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { addDays, format, parse, addHours } = require('date-fns');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

// Sample valid token
const VALID_TOKEN = 'demo123';

// Mock available dates (next 14 days with random availability)
const generateAvailableDates = (days = 14) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE');

    // Randomly determine if this date has available slots
    // Weekend days are less likely to have slots
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const hasSlots = isWeekend ? Math.random() > 0.7 : Math.random() > 0.3;

    dates.push({
      date: dateStr,
      day_of_week: dayOfWeek,
      has_slots: hasSlots
    });
  }

  return dates;
};

// Generate time slots for a specific date
const generateTimeSlots = (dateStr) => {
  const slots = [];
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  
  // No slots on weekends
  const dayOfWeek = format(date, 'EEEE');
  if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
    return [];
  }

  // Generate slots from 9 AM to 5 PM
  let startTime = new Date(date.setHours(9, 0, 0));
  const endTime = new Date(date.setHours(17, 0, 0));

  while (startTime < endTime) {
    const slotStart = format(startTime, 'HH:mm');
    const slotEnd = format(addHours(startTime, 1), 'HH:mm');
    
    // Randomly skip some slots to simulate unavailability
    if (Math.random() > 0.3) {
      slots.push({
        start: slotStart,
        end: slotEnd
      });
    }
    
    startTime = addHours(startTime, 1);
  }
  
  return slots;
};

// Validate token endpoint
app.get('/validate-token', (req, res) => {
  const { token } = req.query;
  res.json({ valid: token === VALID_TOKEN });
});

// Get available dates endpoint
app.get('/available-dates', (req, res) => {
  const { token } = req.query;
  
  if (token !== VALID_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const days = parseInt(req.query.days) || 14;
  const dates = generateAvailableDates(days);
  
  res.json({ dates });
});

// Get time slots endpoint
app.get('/time-slots', (req, res) => {
  const { token, date } = req.query;
  
  if (token !== VALID_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  
  const slots = generateTimeSlots(date);
  
  res.json({ slots });
});

// Create booking endpoint
app.post('/create-booking', (req, res) => {
  const { token, name, email, title, description, date, start_time, end_time } = req.body;
  
  if (token !== VALID_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Validate required fields
  if (!name || !email || !title || !date || !start_time || !end_time) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }
  
  // Generate a mock booking ID
  const bookingId = Math.random().toString(36).substring(2, 10);
  
  // In a real app, you would save this to a database
  console.log('Booking created:', {
    id: bookingId,
    name,
    email,
    title,
    description,
    date,
    start_time,
    end_time
  });
  
  // Return success response
  res.json({
    success: true,
    booking_id: bookingId
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
}); 