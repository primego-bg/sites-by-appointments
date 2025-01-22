import { z } from 'zod'

export const FormDataSchema = z.object({
  location: z.string().min(1, 'Мястото е задължително'),
  barber: z.string().min(1, 'Барбера е задължителен'),
  service: z.string().min(1, 'Услугата е задължителна'),
  data: z.string().min(1, 'Дата е задължителна'),
  hour: z.string().min(1, 'Часът е задължителен'),
  name: z.string().min(1, 'Името е задължително'),
  phone: z.string().min(1, 'Телефонният номер е задължителен'),
  email: z.string().min(1, 'Имейл е задължителен').email('Невалиден имейл адрес'),
  note: z.string().optional(),
  confirm: z.boolean().refine(val => val === true, {
    message: 'Трябва да потвърдите информацията си'
  })
})


export const FormDataSchemaOLD = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'Zip is required')
})