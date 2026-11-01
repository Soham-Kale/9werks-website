"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** "Open now" or "Closed now", computed in Pune time in the visitor's browser. */
export function OpenStatus() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const day = parts.find((p) => p.type === "weekday")?.value ?? "";
      const hm = `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}`;
      const slot = site.hours.find((h) => (h.days as readonly string[]).includes(day));
      setOpen(!!slot && hm >= slot.opens && hm < slot.closes);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  if (open === null) return null;
  return (
    <p className="t-label flex items-center gap-3">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${open ? "bg-champagne" : "bg-line-strong"}`} />
      {open ? "Open now" : "Closed now"}
    </p>
  );
}
