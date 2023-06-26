export class DataCache<T> {
  protected expiresAt: number;
  protected _data: T;

  constructor(data: T, expiration: number) {
    this._data = data;
    this.expiresAt = expiration;
  }

  /** returns a Datacache that expires at the specified time (time is a timestamp) */
  public static cacheUntil<K = any>(data: K,  expiresAt: number): DataCache<K> {
    return new DataCache<K>(data, expiresAt);
  }


  /** Creates a DataCache that expires in the specified amount of time (in ms) */
  public static  cacheFor<K = any>(data: K, expiresIn: number): DataCache<K> {
    const expiresAt = Date.now() + expiresIn;
    return new DataCache<K>(data, expiresAt);
  }

  /** Returns whether or not the cache has expired */
  get expired(): boolean {
    return Date.now() >= this.expiresAt;
  }

  /** If the data is unexpired, return it. Otherwise return undefined */
  get data(): T {
    if (this.expired) {
      return undefined;
    }
    return this._data;
  }
}