import { site } from "./site";

export type BookingInput = {
  name: string;
  phone: string;
  car: string;
  service: string;
  day: string; // yyyy-mm-dd
  notes: string;
};

export type BookingErrors = Partial<Record<keyof BookingInput, string>>;

/** Today's date in Pune, as yyyy-mm-dd. */
export function todayInIndia(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function validateBooking(v: BookingInput, today = todayInIndia()): BookingErrors {
  const e: BookingErrors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  const digits = v.phone.replace(/[^\d]/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) e.phone = "Please enter a 10-digit Indian mobile number.";
  if (v.car.trim().length < 2) e.car = "Please tell us the make and model, for example Porsche Cayenne.";
  if (!v.service) e.service = "Please choose a service.";
  if (!v.day) e.day = "Please choose a preferred day.";
  else if (v.day < today) e.day = "Please choose today or a later day.";
  if (v.notes.length > 800) e.notes = "Please keep notes under 800 characters.";
  return e;
}

export function formatDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function bookingMessage(v: BookingInput) {
  const lines = [
    "Hello 9WERKS, I would like to book a service.",
    "",
    `Name: ${v.name.trim()}`,
    `Phone: ${v.phone.trim()}`,
    `Car: ${v.car.trim()}`,
    `Service: ${v.service}`,
    `Preferred day: ${formatDay(v.day)}`,
  ];
  if (v.notes.trim()) lines.push(`Notes: ${v.notes.trim()}`);
  return lines.join("\n");
}

export function whatsappUrl(v: BookingInput) {
  return `${site.whatsapp}?text=${encodeURIComponent(bookingMessage(v))}`;
}
