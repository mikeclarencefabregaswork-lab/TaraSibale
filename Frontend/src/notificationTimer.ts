/** A countdown that preserves elapsed time across hover and focus pauses. */
export class NotificationTimer {
  private milliseconds: number;
  private startedAt: number | null = null;

  constructor(duration: number) { this.milliseconds = duration; }

  remaining(now: number) {
    return Math.max(0, this.milliseconds - (this.startedAt === null ? 0 : now - this.startedAt));
  }

  pause(now: number) {
    this.milliseconds = this.remaining(now);
    this.startedAt = null;
  }

  resume(now: number) {
    if (this.startedAt === null) this.startedAt = now;
  }
}
