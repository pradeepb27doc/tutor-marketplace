import { cn } from "@/lib/utils";
import { formatDuration, formatDecimalString, formatTransactionTime } from "../lib/format";
import type { BookingDto } from "@/features/booking/types";
import type { PublicTutorDetailDto } from "@/features/tutor-profile/types";
import { Calendar, Clock, Tag } from "lucide-react";

interface BookingSummaryCardProps {
  booking: BookingDto;
  tutor: PublicTutorDetailDto | null;
  subjectName: string;
}

export default function BookingSummaryCard({
  booking,
  tutor,
  subjectName,
}: BookingSummaryCardProps) {
  const currency = booking.currency;
  const price = formatDecimalString(booking.priceAmount, currency);
  const platformFee = formatDecimalString(booking.platformFeeAmount, currency);
  const grandTotal = formatDecimalString(
    (
      Number.parseFloat(booking.priceAmount) +
      Number.parseFloat(booking.platformFeeAmount)
    ).toFixed(2),
    currency,
  );
  const duration = formatDuration(booking.durationMinutes);
  const dateTime = formatTransactionTime(booking.startAt);

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
          Booking summary
        </p>

        <div className="mt-5 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-4xl font-semibold tracking-[-0.055em] text-foreground">
              {grandTotal}
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              Total amount to pay
            </p>
          </div>
          <Tag className="size-6 text-foreground" aria-hidden="true" />
        </div>

        <div className="mt-5 space-y-4">
          {/* Tutor Info */}
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-foreground text-lg font-semibold text-background">
              {tutor?.displayName?.[0] ?? tutor?.userId?.[0] ?? "T"}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {tutor?.displayName ?? "Tutor"}
              </p>
              <p className="mt-1 text-sm text-foreground/50">
                {tutor?.headline ?? "Verified tutor"}
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="rounded-3xl border border-border bg-secondary/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
              Session details
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 text-foreground/40" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/40">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {dateTime.date}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 text-foreground/40" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/40">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {dateTime.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="mt-0.5 size-4 text-foreground/40" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/40">
                    Subject
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {subjectName || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 text-foreground/40" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/40">
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {duration}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-6 space-y-2 border-t border-border pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/56">Session fee</span>
            <span className="text-foreground">{price}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/56">Platform fee</span>
            <span className="text-foreground">{platformFee}</span>
          </div>
          <div className={cn(
            "flex items-center justify-between border-t border-border pt-3 text-lg font-semibold",
          )}>
            <span className="text-foreground/56">Grand total</span>
            <span className="text-foreground">{grandTotal}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
