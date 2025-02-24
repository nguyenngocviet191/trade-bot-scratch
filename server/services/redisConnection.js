
const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    host: 'localhost', // Replace with your Redis server host
    port: 6379 // Replace with your Redis server port
});

// Handle connection events
client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = client;
