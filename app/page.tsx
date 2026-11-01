import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { HomeSections } from "@/components/sections/Home";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <HomeSections />
    </>
  );
}
