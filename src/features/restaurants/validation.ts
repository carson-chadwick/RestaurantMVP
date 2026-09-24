import { z } from "zod";

export const employeeEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid employee email address."));

export const employeeIdSchema = z.uuid();

export type EmployeeActionState = {
  fieldError?: string;
  formError?: string;
  success?: string;
};
