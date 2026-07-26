import {
  CancellationWindowExceededError,
  BookingCannotBeCompletedError,
} from "./booking.errors.js";

/**
 * Pure business-rule functions for the Booking module.
 * These functions do NOT access repositories or databases.
 */

/**
 * Valid status transitions for the booking lifecycle.
 * Key: current status, Value: allowed next statuses.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["ACCEPTED", "REJECTED", "CANCELLED_BY_PARENT", "CANCELLED_BY_TUTOR", "EXPIRED"],
  ACCEPTED: ["COMPLETED", "CANCELLED_BY_PARENT", "CANCELLED_BY_TUTOR", "RESCHEDULED"],
  REJECTED: [],
  CANCELLED_BY_PARENT: [],
  CANCELLED_BY_TUTOR: [],
  COMPLETED: [],
  RESCHEDULED: [],
  EXPIRED: [],
};

/**
 * Returns true if the transition from `currentStatus` to `nextStatus` is allowed.
 */
export function isAllowedTransition(currentStatus: string, nextStatus: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

/**
 * Returns the list of statuses that are considered "active" (i.e., the booking
 * is still in progress and occupies the slot).
 */
export function activeBookingStatuses(): string[] {
  return ["REQUESTED", "ACCEPTED"];
}

/**
 * Returns true if the given status means the slot is still occupied.
 */
export function isSlotOccupied(status: string): boolean {
  return activeBookingStatuses().includes(status);
}

/**
 * Validates that a booking can be cancelled based on the session start time.
 * @param sessionStartAt - The booking's startAt date
 * @param now - The current time
 * @throws CancellationWindowExceededError if the session has already started
 */
export function assertCancellable(sessionStartAt: Date, now: Date): void {
  if (now >= sessionStartAt) {
    throw new CancellationWindowExceededError();
  }
}

/**
 * Validates that a booking can be completed (must be after session end time).
 * @param sessionEndAt - The booking's endAt date
 * @param now - The current time
 * @throws BookingCannotBeCompletedError if the session hasn't ended yet
 */
export function assertCompletable(sessionEndAt: Date, now: Date): void {
  if (now < sessionEndAt) {
    throw new BookingCannotBeCompletedError();
  }
}

/**
 * Calculates the duration in minutes between two dates.
 */
export function calculateDurationMinutes(startAt: Date, endAt: Date): number {
  return Math.round((endAt.getTime() - startAt.getTime()) / 60000);
}

/**
 * Checks if two time ranges overlap.
 */
export function timeRangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Returns the default expiry duration in milliseconds (24 hours).
 */
export function getDefaultExpiryDurationMs(): number {
  return 24 * 60 * 60 * 1000;
}

/**
 * Returns the default slot reservation duration in milliseconds (15 minutes).
 */
export function getDefaultReservationDurationMs(): number {
  return 15 * 60 * 1000;
}