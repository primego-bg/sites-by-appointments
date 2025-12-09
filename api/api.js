const express = require('express');
const app = express();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const dotenv = require('dotenv');
const CalendarService = require('./services/calendar.service');
const EmailService = require('./services/email.service');
const CryptoService = require('./services/crypto.service');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

dotenv.config();

// Log ALL incoming requests BEFORE any middleware
app.use((req, res, next) => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('[REQUEST RECEIVED]');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin || 'no origin header');
  console.log('Host:', req.headers.host);
  console.log('User-Agent:', req.headers['user-agent']?.substring(0, 100) || 'no user agent');
  console.log('All Headers:', JSON.stringify(req.headers, null, 2));
  console.log('═══════════════════════════════════════════════════════');
  next();
});

// CORS configuration with logging
const corsOptions = {
  origin: function (origin, callback) {
    // Log all CORS requests
    console.log('[CORS] Processing origin:', origin || 'no origin header');
    
    // List of allowed origins
    const allowedOrigins = [
      'https://kerelski.com',
      'https://www.kerelski.com',
      'http://kerelski.com',
      'http://www.kerelski.com',
      'https://appointments.sitezup.com',
      'https://www.appointments.sitezup.com',
      'http://appointments.sitezup.com',
      'http://www.appointments.sitezup.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Check if origin contains kerelski.com or sitezup.com
    const isKerelski = origin && origin.includes('kerelski.com');
    const isSitezup = origin && origin.includes('sitezup.com');
    
    // Allow if origin is in the list, contains kerelski.com or sitezup.com, or if there's no origin (same-origin requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || isKerelski || isSitezup) {
      console.log('[CORS] ✓ Allowing request from:', origin || 'same-origin');
      callback(null, true);
    } else {
      console.log('[CORS] ✗ Blocking request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app
    .use(cors(corsOptions))
    .use(express.json({
        limit: '10mb'
    }))
    .use(express.urlencoded({ extended: true, limit: '10mb' }))
    .use('/', limiter)
    .use("/", indexRoute)
    .use(errorHandler)

// Log response
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log('[RESPONSE]', res.statusCode, 'to', req.method, req.url);
    originalSend.call(this, data);
  };
  next();
});

mongo.connect().then(() => {
    console.log("Connected to database");
});

const port = process.env.PORT;

console.log('═══════════════════════════════════════════════════════');
console.log('Starting API server...');
console.log('Port:', port);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('═══════════════════════════════════════════════════════');

app.listen(port, function () {
    console.log("✓ API server is listening on port " + port);
    console.log("✓ Server URL: http://localhost:" + port);
    console.log("✓ Ready to accept requests from kerelski.com");
});

(async function init() { 
    CalendarService.syncAllCalendars();
    //console.log(CryptoService.hash(""));
    //EmailService.sendEmail("67901559235c38f677a13c5c", "vencidim04@gmail.com", "Потвърждение на час", "Това е съобщение за потвърждение на час");
})();
