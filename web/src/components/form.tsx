'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { getAvailableTimeSlots, postEvent } from '@/utils/request'
import { Calendar } from './Calendar';

import moment from 'moment-timezone';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';

const steps = [
  {
    id: 'Стъпка 1',
    name: 'Избор на услуга',
  },
  {
    id: 'Стъпка 2',
    name: 'Избор на дата и час',
  },
  {
    id: 'Стъпка 3',
    name: 'Контактни данни',
  },
  {
    id: 'Стъпка 4',
    name: 'Потвърждение',
  }
]

export default function Form(params: any) {
  const { toast } = useToast();

  const [previousStep, setPreviousStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const [location, setLocation] = useState<any>(null)
  const [employee, setEmployee] = useState<any>(null)
  const [service, setService] = useState<any>(null)

  const [timeSlots, setTimeSlots] = useState<any>(null)
  const [startDt, setStartDt] = useState<any>(null)
  const [endDt, setEndDt] = useState<any>(null)
  // start date used in calendar component
  const [startDate, setStartDate] = useState<any>(new Date())

  const [name, setName] = useState<any>(null)
  const [phone, setPhone] = useState<any>(null)
  const [email, setEmail] = useState<any>(null)

  const [errors, setErrors] = useState<any>({});

  const [shouldRefreshTimeSlots, setShouldRefreshTimeSlots] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [pointerEventsDisabled, setPointerEventsDisabled] = useState(false);

  const delta = currentStep - previousStep

  const business = params.business

  const next = async () => {
    const validateStep = () => {
      let errors: any = {};
      if (currentStep === 0) {
      if (!location) errors.location = 'Изберете локация';
      if (!employee) errors.employee = 'Изберете бръснар';
      if (!service) errors.service = 'Изберете услуга';
      } else if (currentStep === 2) {
      if (!name) errors.name = 'Името е задължително';
      if (!phone) errors.phone = 'Телефонният номер е задължителен';
      if (!email) errors.email = 'Имейлът е задължителен';
      }
      setErrors(errors);
      return Object.keys(errors).length === 0;
    };

    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === 0) {
        await _getAvailableTimeSlots();
      }
      setPreviousStep(currentStep)
      setCurrentStep(step => step + 1)
    }

    if (currentStep === steps.length - 1) {
      await handleSubmit();
    }
  }

  const prev = () => {
    let temp = currentStep;
    if (currentStep > 0) {
      setPreviousStep(currentStep)
      setCurrentStep(step => step - 1)
      triggerValueReset(temp)
    }
    if(temp === 1) {
      setShouldRefreshTimeSlots(false);
    }
  }

  const triggerValueReset = (step: number) => {
    if(step === 0) {
      setShouldRefreshTimeSlots(true);
    }
  }

  const _getAvailableTimeSlots = async () => {
    if (shouldRefreshTimeSlots) {
      setPointerEventsDisabled(true);
  
      const timeout = setTimeout(() => {
        setIsLoading(true);
      }, 500);
  
      try {
        const response = await getAvailableTimeSlots(business.calendar._id, employee, service);
        setTimeSlots(response);
      } catch (error: any) {
        toast({
          title: "Грешка",
          description: error.message,
          variant: "destructive",
        });
        prev();
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
        setPointerEventsDisabled(false);
      }
    }
  };  

  const handleSubmit = async () => {
    setPointerEventsDisabled(true);
  
    const timeout = setTimeout(() => {
      setIsLoading(true);
    }, 500);
  
    try {
      const eventData = {
        calendarId: business.calendar._id,
        employeeId: employee,
        serviceId: service,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDt,
        endDt,
        name,
        email,
        phone,
      };
  
      await postEvent(eventData);
      
      setOriginalState();
  
      toast({
        title: "✅ Успешно записан час!",
        description: "Ще получите копие от резервацията на предоставения имейл",
      });
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
      setPointerEventsDisabled(false);
    }
  };  

  const setOriginalState = () => {
    setPreviousStep(0);
    setCurrentStep(0);

    setLocation(null);
    setEmployee(null);
    setService(null);

    setTimeSlots(null);
    setStartDt(null);
    setEndDt(null);
    setStartDate(new Date());

    setName(null);
    setEmail(null);
    setPhone(null);

    setErrors({});

    setShouldRefreshTimeSlots(false);
  }

  return (
    <>
    {
      isLoading
      ? <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <LoadingSpinner className="text-white" size={36}/>
      </div>
      : null
    }
    <section className={`${pointerEventsDisabled ? 'pointer-events-none' : ''} inset-0 flex flex-col justify-between p-4`}>
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
      <form className='mt-12 py-12'>
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
                  onChange={(e) => {
                    const selectedLocation = e.target.value;
                    setLocation(selectedLocation);
                    setEmployee(null);
                    setService(null);
                    setErrors({ ...errors, location: null, employee: null, service: null });
                    triggerValueReset(0);
                  }}
                  value={location || ''}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm"
                >
                  {!location ? <option value="">Изберете локация</option> : null}
                  {business.locations.map((location: any) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <span className="text-sm text-red-600">{errors.location}</span>
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
                  onChange={(e) => {
                    const selectedEmployee = e.target.value;
                    setEmployee(selectedEmployee);
                    setService(null);
                    const employeeLocation = business.locations.find((loc: any) =>
                      loc.employees.includes(selectedEmployee)
                    )?._id;
                    setLocation(employeeLocation);
                    setErrors({ ...errors, employee: null, service: null, location: null });
                    triggerValueReset(0);
                  }}
                  value={employee || ''}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm"
                >
                  {!employee ? <option value="">Изберете бръснар</option> : null}
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
                  <span className="text-sm text-red-600">{errors.employee}</span>
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
                    setErrors({ ...errors, service: null, employee: null, location: null });
                    triggerValueReset(0);
                  }}
                  value={service || ''}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm"
                >
                  {!service ? <option value="">Изберете услуга</option> : null}
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
                  <span className="text-sm text-red-600">{errors.service}</span>
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
            {
              timeSlots && timeSlots.length > 0
              ? <div className='mt-10'>
                  <Calendar
                    timeSlots={timeSlots}
                    selected={startDate}
                    setSelected={setStartDate}
                    business={params.business}
                    setStartDt={setStartDt}
                    setEndDt={setEndDt} />
                    {
                      startDate
                      ? 
                      <div className='mt-6 grid grid-cols-2 gap-4'>
                          {timeSlots.filter((slot: any) => new Date(slot.start).toISOString().startsWith(new Date(startDate).toISOString().split('T')[0])).map((slot: any) => (
                            <button
                              key={slot.start + slot.end + Math.random().toString()}
                              onClick={() => {                          
                                setStartDt(slot.start);
                                setEndDt(slot.end);
                                next();
                              }}
                              className={`rounded bg-gray-300 py-2 text-gray-700`}
                            >
                              {moment(slot.start).format('HH:mm')}
                            </button>
                          ))}
                        </div>
                      : null
                    }
                </div>
              : <div className="flex flex-row space-x-2 items-center mt-4">
                  <p className='text-zinc-800'>Няма намерени свободни часове за записване</p>
              </div>
            }
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
                    value={name}
                    onChange={(e) => {setName(e.target.value); setErrors({ ...errors, name: null })}}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.name && (
                    <span className='text-sm text-red-600'>{errors.name}</span>
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
                    value={phone}
                    onChange={(e) => {setPhone(e.target.value); setErrors({ ...errors, phone: null })}}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.phone && (
                    <span className='text-sm text-red-600'>{errors.phone}</span>
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
                    value={email}
                    onChange={(e) => {setEmail(e.target.value); setErrors({ ...errors, email: null })}}
                    className='block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:ring-sky-600 sm:text-sm'
                  />
                  {errors.email && (
                    <span className='text-sm text-red-600'>{errors.email}</span>
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
                <strong>Дата:</strong> {moment(startDt)
        .tz(moment.tz.guess())
        .format("DD/MM/YYYY")}
              </p>
              <p>
                <strong>Час:</strong> {moment(startDt)
        .tz(moment.tz.guess())
        .format("HH:mm")}
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
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className='mt-6 flex justify-between'>
          {
            currentStep !== 0
            ? <button
            type='button'
            className='rounded bg-gray-300 py-2 px-4 text-sm font-semibold text-gray-700'
            onClick={prev}
            disabled={currentStep === 0}
          >
            Назад
          </button>
          : null
          }
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
    </>
  )
}
