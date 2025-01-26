'use client';

import Form from '@/components/form'
import { getAvailableTimeSlots, getBusiness, postEvent } from '@/utils/request';
import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BusinessHeader } from '@/components/BusinessHeader';

export default function Home() {
 const [business, setBusiness] = useState<any>(null);
 const [loading, setLoading] = useState<boolean>(false);
 const [availableTimeSlots, setAvailableTimeSlots] = useState<any>(null)
 
 useEffect(() => {
    setLoading(true);
    const currentUrl = window.location.origin;
    const topLevelDomain = currentUrl.split('.').slice(-2).join('.');
    getBusiness(topLevelDomain).then(response => {
      setBusiness(response.business);
      setLoading(false);
    });
    
    /*getAvailableTimeSlots('679021c44aeb1686eec0dc5a', '679021c44aeb1686eec0dc5a', '679021c44aeb1686eec0dc5a').then(response => {
      setAvailableTimeSlots(response.events);
    });*/

  }, []);

  return (
    <section className=''>
      <div className='container'>
        {
          !loading
            ? <>
                {
                  business 
                  ? <div>
                    {
                      business.status === 'active'
                      ? <div>
                          <BusinessHeader business={business} />
                          {
                            business.availableCalendar
                            ? <Form business={business} />
                            : <div>
                                <h1 className='text-2xl font-bold'>Деактивирана система</h1>
                                <p className='mt-3 text-gray-700'>В момента не приемаме нови записвания за часове, тъй като онлайн системата е временно деактивирана. Може да запазите своя час на телефон: <a className='underline text-blue-500' href={`tel:${business.phone}`}>{business.phone}</a></p>
                              </div>
                          }
                        </div>
                      : business.status === 'inactive'
                        ? <div>
                            <h1 className='text-2xl font-bold'>Деактивирана система</h1>
                            <p className='mt-3 text-gray-700'>Изглежда, че не приемаме нови записвания за часове към момента, тъй като системата е временно или трайно деактивирана.</p>
                            </div>
                        : business.status === 'deleted'
                          ? <div>
                              <h1 className='text-2xl font-bold'>Деактивирана система</h1>
                              <p className='mt-3 text-gray-700'>Изглежда, че не приемаме нови записвания за часове към момента, тъй като системата е временно или трайно деактивирана.</p>
                            </div>
                          : null
                    }
                  </div>
                  : <div className="flex flex-row space-x-2 items-center justify-center">
                    <LoadingSpinner className="text-zinc-500" />
                    <p className='text-zinc-800'>Зареждане</p>
                </div>
                }
              </>
          : <div className="flex flex-row space-x-2 items-center justify-center">
            <LoadingSpinner className="text-zinc-500" />
            <p className='text-zinc-800'>Зареждане</p>
        </div>
        }
      </div>
    </section>
  );
}
