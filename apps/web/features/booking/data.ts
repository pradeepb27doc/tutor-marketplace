import type { DayAvailability, PricingBreakdown, TimeSlot, Tutor } from "@/types/booking";

export const tutor: Tutor = {
  id: "tutor_01",
  name: "Dr. Aanya Sharma",
  initials: "AS",
  title: "Senior Mathematics & Physics Tutor",
  badge: "Top verified tutor",
  rating: "4.98",
  reviewCount: 284,
  subjects: ["Mathematics", "Physics", "JEE Foundation", "CBSE Grade 8-12"],
  experience: "11 years",
  location: "South Delhi · Online worldwide",
  teachingMode: "Online + Offline",
  hourlyRate: "₹1,250/hr",
  trialRate: "₹499",
};

const daySlots: Record<number, TimeSlot[]> = {
  1: [
    { id: "mon-1", time: "7:00 PM", available: true },
    { id: "mon-2", time: "8:30 PM", available: true },
  ],
  2: [{ id: "tue-1", time: "6:30 PM", available: true }],
  3: [
    { id: "wed-1", time: "5:00 PM", available: true },
    { id: "wed-2", time: "7:30 PM", available: true },
  ],
  4: [{ id: "thu-1", time: "Booked", available: false }],
  5: [
    { id: "fri-1", time: "6:00 PM", available: true },
    { id: "fri-2", time: "8:00 PM", available: true },
  ],
  6: [
    { id: "sat-1", time: "10:00 AM", available: true },
    { id: "sat-2", time: "12:30 PM", available: true },
  ],
  0: [{ id: "sun-1", time: "11:00 AM", available: true }],
};

export function generateWeekDates(): DayAvailability[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const days: DayAvailability[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const dayOfWeek = date.getDay();

    days.push({
      date: date.toISOString().split("T")[0],
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString("en-US", { month: "short" }),
      isToday: date.toDateString() === today.toDateString(),
      slots: daySlots[dayOfWeek] ?? [],
    });
  }
  return days;
}

export const pricingBreakdown: PricingBreakdown[] = [
  { label: "Trial class", amount: "₹499" },
  { label: "Platform fee", amount: "₹20" },
  { label: "Taxes (18%)", amount: "₹9.20" },
  { label: "Total", amount: "₹528.20" },
];

export const subjectOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Coding",
  "Music",
  "JEE Foundation",
  "CBSE Grade 8-12",
];
