import "server-only";
import { publicDatabase } from "./supabase/public";
import { conversion } from "@/config/content/conversion";
export type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
};
export type FAQ = { id: string; question: string; answer: string };
export async function publicContent() {
  const db = publicDatabase();
  if (!db)
    return {
      testimonials: [] as Testimonial[],
      faqs: conversion.faqs as FAQ[],
    };
  const [testimonials, faqs] = await Promise.all([
    db
      .from("testimonials")
      .select("id,name,text,rating")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(12),
    db
      .from("faqs")
      .select("id,question,answer")
      .eq("published", true)
      .order("sort_order")
      .limit(30),
  ]);
  return {
    testimonials: (testimonials.data ?? []) as Testimonial[],
    faqs: (faqs.data?.length ? faqs.data : conversion.faqs) as FAQ[],
  };
}
