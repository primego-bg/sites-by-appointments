'use server';

import { stepOneSchema } from '@/schemas';
import { AddDealRoutes, FormErrors } from '@/types';
import { redirect } from 'next/navigation';

export const stepOneFormAction = async (
  prevState: FormErrors | undefined,
  formData: FormData
): Promise<FormErrors | undefined> => {
  const data = Object.fromEntries(formData.entries());
  const validated = stepOneSchema.safeParse(data);

  if (!validated.success) {
    const errors = validated.error.issues.reduce((acc: FormErrors, issue) => {
      const path = issue.path[0] as string;
      acc[path] = issue.message;
      return acc;
    }, {} as FormErrors); // Ensure initial value has correct type
    return errors;
  }

  // Redirect to the next route after successful validation
  redirect(AddDealRoutes.COUPON_DETAILS);

  // Optionally, return undefined explicitly (not necessary but clearer)
  return undefined;
};
