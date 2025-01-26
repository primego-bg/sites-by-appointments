'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { set, z } from 'zod'
import { FormDataSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'

type Inputs = z.infer<typeof FormDataSchema>

const steps = [
  {
    id: 'Стъпка 1',
    name: 'Избор на услуга',
    fields: ['location', 'employee', 'service']
  },
  {
    id: 'Стъпка 2',
    name: 'Избор на дата и час',
    fields: ['data', 'hour']
  },
  {
    id: 'Стъпка 3',
    name: 'Контактни данни',
    fields: ['name', 'phone', 'email']
  },
  {
    id: 'Стъпка 4',
    name: 'Потвърждение',
    fields: ['confirm']
  }
]

export default function Form(params: any) {
  const [previousStep, setPreviousStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const [location, setLocation] = useState<any>(null)
  const [employee, setEmployee] = useState<any>(null)
  const [service, setService] = useState<any>(null)

  const [startDt, setStartDt] = useState<any>(null)
  const [endDt, setEndDt] = useState<any>(null)

  const [name, setName] = useState<any>(null)
  const [phone, setPhone] = useState<any>(null)
  const [email, setEmail] = useState<any>(null)

  const delta = currentStep - previousStep

  const business = params.business

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
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Избиране на услуга
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-y-6 sm:grid-cols-6">
              {/* Location Selector */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Локация
                </label>
                <select
                  id="location"
                  {...register('location')}
                  onChange={(e) => {
                    const selectedLocation = e.target.value;
                    setLocation(selectedLocation);
                    setEmployee(null);
                    setService(null);
                  }}
                  value={location || ''}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm"
                >
                  <option value="">Изберете локация</option>
                  {business.locations.map((location: any) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <span className="text-sm text-red-600">{errors.location.message}</span>
                )}
              </div>

              {/* Employee Selector */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="employee"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Бръснар
                </label>
                <select
                  id="employee"
                  {...register('employee')}
                  onChange={(e) => {
                    const selectedEmployee = e.target.value;
                    setEmployee(selectedEmployee);
                    setService(null);
                    const employeeLocation = business.locations.find((loc: any) =>
                      loc.employees.includes(selectedEmployee)
                    )?._id;
                    setLocation(employeeLocation);
                  }}
                  value={employee || ''}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm"
                >
                  <option value="">Изберете бръснар</option>
                  {location
                    ? business.locations
                  .find((loc: any) => loc._id === location)
                  ?.employees.map((employeeId: any) => {
                    const employee = business.employees.find(
                      (emp: any) => emp._id === employeeId
                    );
                    return (
                      <option key={employee._id} value={employee._id}>
                        {employee.name}
                      </option>
                    );
                  })
                    : business.employees.map((employee: any) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                      ))}
                </select>
                {errors.employee && (
                  <span className="text-sm text-red-600">{errors.employee.message}</span>
                )}
              </div>

              {/* Service Selector */}
                <div className="sm:col-span-3">
                <label
                  htmlFor="service"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Услуга
                </label>
                <select
                  id="service"
                  {...register('service')}
                  onChange={(e) => {
                  const selectedService = e.target.value;
                  setService(selectedService);
                  if (!selectedService) {
                    setLocation(null);
                    setEmployee(null);
                  } else {
                    const barberWithService = business.employees.find((emp: any) =>
                    emp.services.includes(selectedService)
                    );
                    if (barberWithService) {
                    setEmployee(barberWithService._id);
                    const employeeLocation = business.locations.find((loc: any) =>
                      loc.employees.includes(barberWithService._id)
                    )?._id;
                    setLocation(employeeLocation);
                    }
                  }
                  }}
                  value={service || ''}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm"
                >
                  <option value="">Изберете услуга</option>
                  {employee
                  ? business.employees
                    .find((emp: any) => emp._id === employee)
                    ?.services.map((serviceId: any) => {
                      const service = business.services.find(
                      (srv: any) => srv._id === serviceId
                      );
                      return (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                      );
                    })
                  : business.services.map((service: any) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                    ))}
                </select>
                {errors.service && (
                  <span className="text-sm text-red-600">{errors.service.message}</span>
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
            <div className='mt-10'>
              <div className='sm:grid sm:grid-cols-2 sm:gap-x-6'>
                <div className='sm:col-span-1'>
                  <label
                    htmlFor='date'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Дата
                  </label>
                  <input
                    type='date'
                    id='date'
                    {...register('data')}
                    onChange={(e) => setStartDt(e.target.value)}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.data && (
                    <span className='text-sm text-red-600'>{errors.data.message}</span>
                  )}
                </div>
                <div className='sm:col-span-1'>
                  <label
                    htmlFor='time'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Час
                  </label>
                  <input
                    type='time'
                    id='time'
                    {...register('hour')}
                    onChange={(e) => setEndDt(e.target.value)}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.hour && (
                    <span className='text-sm text-red-600'>{errors.hour.message}</span>
                  )}
                </div>
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
            <div className='mt-10'>
              <div className='sm:grid sm:grid-cols-2 sm:gap-x-6'>
                <div className='sm:col-span-1'>
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
                    onChange={(e) => setName(e.target.value)}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.name && (
                    <span className='text-sm text-red-600'>{errors.name.message}</span>
                  )}
                </div>
                <div className='sm:col-span-1'>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Телефон
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    {...register('phone')}
                    onChange={(e) => setPhone(e.target.value)}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.phone && (
                    <span className='text-sm text-red-600'>{errors.phone.message}</span>
                  )}
                </div>
                <div className='sm:col-span-1'>
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
                    onChange={(e) => setEmail(e.target.value)}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.email && (
                    <span className='text-sm text-red-600'>{errors.email.message}</span>
                  )}
                </div>
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
                <strong>Локация:</strong> {business.locations.find((loc: any) => loc._id === location)?.name}
              </p>
              <p>
                <strong>Бръснар:</strong> {business.employees.find((emp: any) => emp._id === employee)?.name}
              </p>
              <p>
                <strong>Услуга:</strong> {business.services.find((srv: any) => srv._id === service)?.name}
              </p>
              <p>
                <strong>Дата:</strong> {startDt}
              </p>
              <p>
                <strong>Час:</strong> {endDt}
              </p>
              <p>
                <strong>Име:</strong> {name}
              </p>
              <p>
                <strong>Телефон:</strong> {phone}
              </p>
              <p>
                <strong>Имейл:</strong> {email}
              </p>
              {/*<p>
                <strong>Бележка:</strong> {watch('note')}
              </p>*/}
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
