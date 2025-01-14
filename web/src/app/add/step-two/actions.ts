'use server';

import { stepTwoSchema } from '@/schemas';
import { AddDealRoutes, FormErrors } from '@/types';
import { redirect } from 'next/navigation';

export const stepTwoFormAction = async (
  prevState: FormErrors | undefined,
  formData: FormData
): Promise<FormErrors | undefined> => {
  const data = Object.fromEntries(formData.entries());
  const validated = stepTwoSchema.safeParse(data);

  if (!validated.success) {
    const errors = validated.error.issues.reduce((acc: FormErrors, issue) => {
      const path = issue.path[0] as string;
      acc[path] = issue.message;
      return acc;
    }, {} as FormErrors); // Initialize with the correct type
    return errors;
  }

  // Redirect to the next route after successful validation
  redirect(AddDealRoutes.CONTACT_INFO);

  // Optionally return undefined explicitly (not strictly necessary but clear)
  return undefined;
};
