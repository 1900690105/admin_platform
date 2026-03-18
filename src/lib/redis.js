import Redis from "ioredis";

let redis;

try {
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });

  redis.on("error", () => {});
} catch {
  redis = null;
}

export default redis;
