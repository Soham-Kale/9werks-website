"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { lockScroll } from "@/lib/scroll";
import { site } from "@/lib/site";

export const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Transparent over the hero, solid once scrolled; hides on scroll down.
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setSolid(y > 24);
        setHidden(y > 320 && y > lastY + 2);
        if (y < lastY - 2) setHidden(false);
        lastY = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the menu on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Menu overlay: lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const menu = menuRef.current;
    const focusables = () =>
      Array.from(menu?.querySelectorAll<HTMLElement>("a, button") ?? []).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab") {
        const els = [toggleRef.current!, ...focusables()];
        const i = els.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          els[els.length - 1].focus();
        } else if (!e.shiftKey && i === els.length - 1) {
          e.preventDefault();
          els[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-out ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${solid || open ? "border-b border-line bg-obsidian/95" : "border-b border-transparent"}`}
    >
      <nav aria-label="Main" className="shell grid h-[var(--nav-h)] grid-cols-[1fr_auto_1fr] items-center">
        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="t-label link" aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="col-start-1 flex items-center gap-3 justify-self-start md:col-start-2 md:justify-self-center"
          aria-label="9WERKS home"
        >
          <Logo height={34} preload />
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-6">
          <a href={`tel:${site.phoneE164}`} className="t-label link hidden xl:inline">
            {site.phoneDisplay}
          </a>
          {/* Wrapper carries the breakpoint: .btn sets its own display and would beat `hidden` */}
          <span className="hidden md:inline-flex">
            <Link href="/booking" className="btn btn-primary !min-h-[44px] !px-5">
              Book a service
            </Link>
          </span>
          <button
            ref={toggleRef}
            type="button"
            className="t-label tap flex items-center gap-3 md:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-ivory transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-full bg-ivory transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="site-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] overflow-y-auto bg-obsidian md:hidden"
      >
        <div className="shell flex min-h-full flex-col justify-between py-10">
          <ul className="flex flex-col">
            {[{ href: "/", label: "Home" }, ...navLinks, { href: "/booking", label: "Booking" }].map((l, i) => (
              <li key={l.href} className="border-b border-line">
                <Link
                  href={l.href}
                  className="flex items-baseline justify-between py-5"
                  aria-current={pathname === l.href ? "page" : undefined}
                >
                  <span className="t-display-m">{l.label}</span>
                  <span className="t-label text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-col gap-4">
            <Link href="/booking" className="btn btn-primary w-full">
              Book a service
            </Link>
            <a href={site.whatsapp} className="btn w-full" target="_blank" rel="noopener noreferrer">
              WhatsApp {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
