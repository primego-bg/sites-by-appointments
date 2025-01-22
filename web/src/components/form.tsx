'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { z } from 'zod'
import { FormDataSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'

type Inputs = z.infer<typeof FormDataSchema>

const steps = [
  {
    id: 'Стъпка 1',
    name: 'Избиране на услуга',
    fields: ['location', 'barber', 'service']
  },
  {
    id: 'Стъпка 2',
    name: 'Избиране на дата и час',
    fields: ['data', 'hour']
  },
  {
    id: 'Стъпка 3',
    name: 'Вашите данни',
    fields: ['name', 'phone', 'email', 'note']
  },
  {
    id: 'Стъпка 4',
    name: 'Потвърждение',
    fields: ['confirm']
  }
]

export default function Form() {
  const [previousStep, setPreviousStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const delta = currentStep - previousStep

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema)
  })

  const processForm: SubmitHandler<Inputs> = data => {
    console.log(data)
    reset()
  }

  type FieldName = keyof Inputs

  const next = async () => {
    const fields = steps[currentStep].fields
    const output = await trigger(fields as FieldName[], { shouldFocus: true })

    if (!output) return

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)()
      }
      setPreviousStep(currentStep)
      setCurrentStep(step => step + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep)
      setCurrentStep(step => step - 1)
    }
  }

  return (
    <section className='absolute inset-0 flex flex-col justify-between p-24'>
      {/* Steps Navigation */}
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
          {steps.map((step, index) => (
            <li key={step.name} className='md:flex-1'>
              {currentStep > index ? (
                <div className='group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-sky-600 transition-colors'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className='flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                  aria-current='step'
                >
                  <span className='text-sm font-medium text-sky-600'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : (
                <div className='group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-gray-500 transition-colors'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className='mt-12 py-12' onSubmit={handleSubmit(processForm)}>
        {/* Step 1 */}
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              Избиране на услуга
            </h2>
            <div className='mt-10 grid grid-cols-1 gap-y-6 sm:grid-cols-6'>
              <div className='sm:col-span-3'>
                <label
                  htmlFor='location'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Локация
                </label>
                <select
                  id='location'
                  {...register('location')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                >
                  <option value='Локация 1'>Локация 1</option>
                  <option value='Локация 2'>Локация 2</option>
                </select>
                {errors.location && (
                  <span className='text-sm text-red-600'>{errors.location.message}</span>
                )}
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='barber'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Бръснар
                </label>
                <select
                  id='barber'
                  {...register('barber')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                >
                  <option value='Бръснар 1'>Бръснар 1</option>
                  <option value='Бръснар 2'>Бръснар 2</option>
                </select>
                {errors.barber && (
                  <span className='text-sm text-red-600'>{errors.barber.message}</span>
                )}
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='service'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Услуга
                </label>
                <select
                  id='service'
                  {...register('service')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                >
                  <option value='Услуга 1'>Услуга 1</option>
                  <option value='Услуга 2'>Услуга 2</option>
                </select>
                {errors.service && (
                  <span className='text-sm text-red-600'>{errors.service.message}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              Избиране на дата и час
            </h2>
            <div className='mt-10 grid grid-cols-1 gap-y-6 sm:grid-cols-6'>
              <div className='sm:col-span-3'>
                <label
                  htmlFor='data'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Дата
                </label>
                <input
                  type='date'
                  id='data'
                  {...register('data')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                />
                {errors.data && (
                  <span className='text-sm text-red-600'>{errors.data.message}</span>
                )}
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='hour'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Час
                </label>
                <select
                  id='hour'
                  {...register('hour')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                >
                  <option value='10:00'>10:00</option>
                  <option value='11:00'>11:00</option>
                  <option value='12:00'>12:00</option>
                </select>
                {errors.hour && (
                  <span className='text-sm text-red-600'>{errors.hour.message}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              Вашите данни
            </h2>
            <div className='mt-10 grid grid-cols-1 gap-y-6 sm:grid-cols-6'>
              <div className='sm:col-span-3'>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Име
                </label>
                <input
                  type='text'
                  id='name'
                  {...register('name')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                />
                {errors.name && (
                  <span className='text-sm text-red-600'>{errors.name.message}</span>
                )}
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Телефон
                </label>
                <input
                  type='text'
                  id='phone'
                  {...register('phone')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                />
                {errors.phone && (
                  <span className='text-sm text-red-600'>{errors.phone.message}</span>
                )}
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Имейл
                </label>
                <input
                  type='email'
                  id='email'
                  {...register('email')}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                />
                {errors.email && (
                  <span className='text-sm text-red-600'>{errors.email.message}</span>
                )}
              </div>

              <div className='sm:col-span-6'>
                <label
                  htmlFor='note'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Бележка
                </label>
                <textarea
                  id='note'
                  {...register('note')}
                  rows={3}
                  className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                />
                {errors.note && (
                  <span className='text-sm text-red-600'>{errors.note.message}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4 */}
        {currentStep === 3 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              Потвърждение
            </h2>
            <div className='mt-10'>
              <p>
                <strong>Локация:</strong> {watch('location')}
              </p>
              <p>
                <strong>Бръснар:</strong> {watch('barber')}
              </p>
              <p>
                <strong>Услуга:</strong> {watch('service')}
              </p>
              <p>
                <strong>Дата:</strong> {watch('data')}
              </p>
              <p>
                <strong>Час:</strong> {watch('hour')}
              </p>
              <p>
                <strong>Име:</strong> {watch('name')}
              </p>
              <p>
                <strong>Телефон:</strong> {watch('phone')}
              </p>
              <p>
                <strong>Имейл:</strong> {watch('email')}
              </p>
              <p>
                <strong>Бележка:</strong> {watch('note')}
              </p>
            </div>
            <button
              type='submit'
              className='mt-6 w-full rounded bg-sky-600 py-2 text-white'
            >
              Потвърди
            </button>
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className='mt-6 flex justify-between'>
          <button
            type='button'
            className='rounded bg-gray-300 py-2 px-4 text-sm font-semibold text-gray-700'
            onClick={prev}
            disabled={currentStep === 0}
          >
            Назад
          </button>
          <button
            type='button'
            className='rounded bg-sky-600 py-2 px-4 text-sm font-semibold text-white'
            onClick={next}
          >
            {currentStep === steps.length - 1 ? 'Потвърди' : 'Напред'}
          </button>
        </div>
      </form>
    </section>
  )
}
