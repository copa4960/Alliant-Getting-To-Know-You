import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

await redisClient.connect();

export const setValue = async (key: string, value: string): Promise<void> => {
  await redisClient.set(key, value);
};

export const getValue = async (key: string): Promise<string | null> => {
  return redisClient.get(key);
};