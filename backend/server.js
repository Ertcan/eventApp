const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
const jwtSecret = 'EventApp';

app.use(cors());
app.use(bodyParser.json());


const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


app.use('/uploads', express.static(uploadsDir));



// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, password, profile_image } = req.body;
    const result = await pool.query(
      'INSERT INTO Users (username, password, profile_image) VALUES ($1, $2, $3) RETURNING *',
      [username, password, profile_image]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// User login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid credentials');
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Directory for photo storage
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage });

app.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const filePath = path.relative(__dirname, req.file.path);
  res.json({ filePath: `${filePath}` });
});

app.get('/incident-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM IncidentTypes');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('initialIncidents', async () => {
    try {
      const result = await pool.query(`SELECT i.*, it.type AS incident_type FROM Incident i JOIN IncidentTypes it ON i.type = it.id WHERE 
    i.isactive = true`);
      socket.emit('initialIncidents', result.rows); 
    } catch (err) {
      console.error('Error fetching incidents:', err.message); 
    }
  });

  socket.on('incidentUpdate', async (newIncident) => {
    console.log('New incident update received:', newIncident);
  
    try {
     
      const { lat, lon, type, address, image_address, views, isactive } = newIncident;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
  
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates');
      }
  
     
      const result = await pool.query(
        'INSERT INTO Incident (lat, lon, type, address, image, views, isactive) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [latitude, longitude, type, address, image_address, views, isactive]
      );
  
    
      const insertedIncident = result.rows[0];
  
      
      io.emit('incidentUpdate', insertedIncident); 
     
    } catch (error) {
      console.error('Error inserting new incident:', error);
    }
  });
  

  
  socket.on('viewIncrement', async ({ id }) => {
    console.log('View increment for id:', id);

    try {
    
      await pool.query(
        'UPDATE incident SET views = views + 1 WHERE id = $1',
        [id]
      );

     
      io.emit('viewIncrement', { id });
    
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  });

  
  socket.on('markAsGone', async ({ id }) => {
    console.log('Mark as gone for id:', id);

    try {
     
      await pool.query(
        'UPDATE incident SET isactive = false WHERE id = $1',
        [id]
      );

    
      io.emit('markAsGone', { id });
     
    } catch (error) {
      console.error('Error marking incident as gone:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
