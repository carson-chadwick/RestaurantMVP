import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(50, `${label} must be 50 characters or fewer.`);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z
  .object({
    firstName: nameSchema("First name"),
    lastName: nameSchema("Last name"),
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const restaurantSignupSchema = signupSchema.safeExtend({
  restaurantName: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100, "Restaurant name must be 100 characters or fewer."),
});

export const employeeSignupSchema = signupSchema;

export type AuthFieldErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "restaurantName"
    | "email"
    | "password"
    | "confirmPassword",
    string[]
  >
>;

export type AuthActionState = {
  fieldErrors?: AuthFieldErrors;
  formError?: string;
};
