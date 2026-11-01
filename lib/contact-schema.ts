import { z } from "zod";
import { YEARS } from "./contact-options";

/** Shared by the form (instant feedback) and the API route (source of truth). */

const base = {
  name: z.string().trim().min(2, "Enter your name.").max(80, "Keep your name under 80 characters."),
  email: z.string().trim().email("Enter an email address we can reply to, like name@college.edu."),
  // Honeypot. Real people never see this field.
  website: z.string().max(0).optional(),
};

const message = z
  .string()
  .trim()
  .min(20, "Tell us a little more: at least 20 characters.")
  .max(1500, "Keep it under 1500 characters.");

const general = { ...base, organisation: z.string().trim().max(120).optional(), message };

export const ContactSchema = z.discriminatedUnion("intent", [
  z.object({
    ...base,
    intent: z.literal("join"),
    year: z.enum(YEARS, { errorMap: () => ({ message: "Choose your year." }) }),
    branch: z.string().trim().min(2, "Enter your branch or department.").max(80),
    message,
  }),
  z.object({ ...general, intent: z.literal("collaborate") }),
  z.object({ ...general, intent: z.literal("sponsor") }),
  z.object({ ...general, intent: z.literal("question") }),
]);

export type ContactInput = z.infer<typeof ContactSchema>;
