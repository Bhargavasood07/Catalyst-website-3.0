/** Plain constants shared by the form UI and the schema. Kept free of zod so the form's first render stays light. */

export const INTENTS = [
  { id: "join", label: "Join the society" },
  { id: "collaborate", label: "Collaborate" },
  { id: "sponsor", label: "Sponsor" },
  { id: "question", label: "Ask a question" },
] as const;

export const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Postgraduate"] as const;

export type ContactIntent = (typeof INTENTS)[number]["id"];
