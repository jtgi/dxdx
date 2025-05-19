import { LRUCache } from "lru-cache";

export const cache = new LRUCache({
  max: 500, // Maximum number of items to store
  ttl: 1000 * 60 * 5, // Cache items for 5 minutes
});
