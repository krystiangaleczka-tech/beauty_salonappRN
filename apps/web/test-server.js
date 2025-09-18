import express from 'express';
import cors from 'cors';
import { mockServices } from './src/app/api/services/mock-data.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8082',
    'http://192.168.100.55:3000', 
    'http://192.168.100.55:8082',
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,
    /^http:\/\/192\.168\.\d+\.\d+:8082$/,
    /^http:\/\/84\.40\.158\.244:3000$/,
    /^http:\/\/84\.40\.158\.244:8082$/
  ],
  credentials: true
}));

app.use(express.json());

// Services API endpoint
app.get('/api/services', (req, res) => {
  try {
    console.log('GET /api/services - Using mock data');
    
    // Use mock data since database might not be available
    const services = mockServices.filter(service => service.is_active);
    
    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {});
    
    const response = { 
      services,
      servicesByCategory 
    };
    
    console.log(`Returning ${services.length} services in ${Object.keys(servicesByCategory).length} categories`);
    res.json(response);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
  console.log(`Services endpoint: http://0.0.0.0:${PORT}/api/services`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
});
