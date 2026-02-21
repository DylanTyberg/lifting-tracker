var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.status(200).json({ 
    message: 'Lifting Tracker API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

router.get('/health', function(req, res, next) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
