import Redis from "ioredis";

/**
 * Cache that stores data in a JSON file.
 */
export class Cache {
    /**
   * Cache client backed by Redis
   *
   * @param {string} prefix
   * @param {number} redisPort
   * @param {string} redisHost
   */
  constructor(prefix, redisPort, redisHost) {
    this._client = new Redis({
      keyPrefix: prefix,
      port: redisPort,
      host: redisHost,
    });
  }

  /**
   * Read an entry from the cache, or return `null` if the existing entry's
   * version does not match `version`.
   *
   * @param {string} key
   * @param {string} version
   */
  async get(key, version) {
    // TODO - Prevent use of standard object properties as keys;
    const entry = JSON.parse(await this._client.get(key) ?? "{}");
    if (entry?.version !== version) {
      return null;
    }

    return entry.value;
  }

  /**
   * Write an entry to the cache. Writes are not flush to disk until {@link flush}
   * is called.
   *
   * @param {string} key
   * @param {string} version
   * @param {any} value
   */
  async set(key, version, value) {
    await this._client.set(key, JSON.stringify({ version, value }));
  }

  async close() {
    return this._client.disconnect();
  }
}
