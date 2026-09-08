export class LatestWinsKeyedQueue<K, V, R> {
  private readonly pending = new Map<K, { value: V; waiters: Array<{ resolve(value: R): void; reject(error: unknown): void }> }>();
  private readonly order: K[] = [];
  private running = false;

  constructor(private readonly worker: (value: V, key: K) => Promise<R>) {}

  enqueue(key: K, value: V): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const existing = this.pending.get(key);
      if (existing) {
        existing.value = value;
        existing.waiters.push({ resolve, reject });
      } else {
        this.pending.set(key, { value, waiters: [{ resolve, reject }] });
        this.order.push(key);
      }
      void this.pump();
    });
  }

  private async pump(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      while (this.order.length) {
        const key = this.order.shift() as K;
        const entry = this.pending.get(key);
        if (!entry) continue;
        this.pending.delete(key);
        try {
          const result = await this.worker(entry.value, key);
          for (const waiter of entry.waiters) waiter.resolve(result);
        } catch (error) {
          for (const waiter of entry.waiters) waiter.reject(error);
        }
      }
    } finally {
      this.running = false;
      if (this.order.length) void this.pump();
    }
  }
}
