import type { Clock } from "@tutor-marketplace/application";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}