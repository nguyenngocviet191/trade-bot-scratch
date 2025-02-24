import { createClient, RedisClientType } from 'redis';

// Create a Redis client
const client: RedisClientType = createClient({
    url: 'redis://localhost:6379' // Replace with your Redis server URL
});

// Handle connection events
client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err: Error) => {
    console.error('Redis error:', err);
});

export default client;
