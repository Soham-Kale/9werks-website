"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { services } from "@/lib/services";
import { validateBooking, whatsappUrl, todayInIndia, type BookingInput, type BookingErrors } from "@/lib/booking";

const OTHER = "Not sure yet, please advise";
const empty: BookingInput = { name: "", phone: "", car: "", service: "", day: "", notes: "" };
const order: (keyof BookingInput)[] = ["name", "phone", "car", "service", "day", "notes"];

// Browser-only values read without an effect: today's date in Pune, and a
// service preselected from /services via ?service=slug.
const noSubscribe = () => () => {};
const presetService = () => services.find((s) => s.slug === new URLSearchParams(window.location.search).get("service"))?.title ?? "";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: keyof BookingInput;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={`f-${id}`} className="t-label mb-3 text-muted">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`f-${id}-hint`} className="t-body-s mt-2 text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`f-${id}-error`} className="t-body-s mt-2 flex items-center gap-2 text-ivory">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-champagne" />
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingForm() {
  const [draft, setV] = useState<BookingInput>(empty);
  const today = useSyncExternalStore(noSubscribe, todayInIndia, () => undefined);
  const preset = useSyncExternalStore(noSubscribe, presetService, () => "");
  const v: BookingInput = { ...draft, service: draft.service || preset };
  const [errors, setErrors] = useState<BookingErrors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const tried = useRef(false);

  const set = (k: keyof BookingInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    if (tried.current) setErrors(validateBooking(next));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tried.current = true;
    const errs = validateBooking(v);
    setErrors(errs);
    const first = order.find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus();
      return;
    }
    const url = whatsappUrl(v);
    // With "noopener" window.open always returns null, so detach the opener by hand.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.assign(url);
    setSentUrl(url);
  };

  useEffect(() => {
    if (sentUrl) doneRef.current?.focus();
  }, [sentUrl]);

  const errCount = Object.keys(errors).length;
  const a11y = (k: keyof BookingInput, hint = false) => ({
    id: `f-${k}`,
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `f-${k}-error` : hint ? `f-${k}-hint` : undefined,
  });

  if (sentUrl) {
    return (
      <div ref={doneRef} tabIndex={-1} className="border border-line p-8 outline-none md:p-12" role="status">
        <p className="t-label text-champagne">Almost done</p>
        <h2 className="t-display-m mt-6">Send the message in WhatsApp to confirm.</h2>
        <p className="t-body-l mt-6 max-w-[48ch] text-muted">
          WhatsApp has opened with your booking details filled in. Press send there, and we will confirm your slot on WhatsApp.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Open WhatsApp again <span className="arrow" aria-hidden="true" />
          </a>
          <button type="button" className="btn" onClick={() => setSentUrl(null)}>
            Edit details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby="form-note" className="flex flex-col gap-8">
      <div aria-live="polite" className="sr-only">
        {errCount ? `${errCount} ${errCount === 1 ? "field needs" : "fields need"} attention.` : ""}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input {...a11y("name")} className="field" autoComplete="name" value={v.name} onChange={set("name")} required />
        </Field>
        <Field id="phone" label="Phone number" hint="10-digit mobile. We reply on WhatsApp." error={errors.phone}>
          <input {...a11y("phone", true)} className="field" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} required />
        </Field>
      </div>
      <Field id="car" label="Car make and model" hint="For example: BMW M4, Porsche Cayenne" error={errors.car}>
        <input {...a11y("car", true)} className="field" value={v.car} onChange={set("car")} required />
      </Field>
      <div className="grid gap-8 md:grid-cols-2">
        <Field id="service" label="Service required" error={errors.service}>
          <select {...a11y("service")} className="field" value={v.service} onChange={set("service")} required>
            <option value="" disabled>
              Choose a service
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value={OTHER}>{OTHER}</option>
          </select>
        </Field>
        <Field id="day" label="Preferred day" hint="Mon to Fri 9 AM to 9 PM, Sat and Sun 9 AM to 12 PM" error={errors.day}>
          <input {...a11y("day", true)} className="field" type="date" min={today} value={v.day} onChange={set("day")} required />
        </Field>
      </div>
      <Field id="notes" label="Additional notes (optional)" hint="Symptoms, warning lights, anything we should know." error={errors.notes}>
        <textarea {...a11y("notes", true)} className="field" rows={5} maxLength={800} value={v.notes} onChange={set("notes")} />
      </Field>
      <div className="flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
        <p id="form-note" className="t-body-s max-w-[46ch] text-muted">
          Submitting opens WhatsApp with your details ready to send to 9WERKS. Nothing is stored on this website.
        </p>
        <button type="submit" className="btn btn-primary">
          Continue on WhatsApp <span className="arrow" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
