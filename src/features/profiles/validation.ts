import { z } from "zod";

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(50, `${label} must be 50 characters or fewer.`);

export const personalProfileSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
});

export type ProfileActionState = {
  fieldErrors?: Partial<Record<"firstName" | "lastName", string[]>>;
  formError?: string;
  success?: string;
};
