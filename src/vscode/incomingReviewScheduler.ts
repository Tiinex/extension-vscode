/**
 * Incoming carrier orientation and the local exact-byte review are distinct gates.
 * Serializing background comparisons avoids a second expensive batch competing
 * with the selected recipient's first qualified Handoff preview.
 *
 * The host owns scheduling; Core still owns both qualification and comparison.
 */
export class IncomingReviewScheduler {
  private tail: Promise<void> = Promise.resolve();

  enqueue(isCurrent: () => boolean, compare: () => Promise<void>, onSettled: () => void, onFailure: (error: unknown) => void): void {
    this.tail = this.tail.catch(() => undefined).then(async () => {
      if (!isCurrent()) return;
      try {
        await compare();
      } catch (error) {
        onFailure(error);
      } finally {
        // A closed, refreshed or superseded Incoming package must never be
        // repainted by a stale background result.
        if (isCurrent()) onSettled();
      }
    });
  }
}
