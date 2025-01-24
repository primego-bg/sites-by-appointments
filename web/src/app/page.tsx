'use client';

import Form from '@/components/form'
import { getAvailableTimeSlots, getBusiness, postEvent } from '@/utils/request';

import { useEffect, useState } from 'react';

export default function Home() {
 const [business, setBusiness] = useState<any>(null)
 const [availableTimeSlots, setAvailableTimeSlots] = useState<any>(null)
 
 useEffect(() => {
    const currentUrl = window.location.origin;
    const topLevelDomain = currentUrl.split('.').slice(-2).join('.');
    getBusiness(topLevelDomain).then(response => {
      setBusiness(response.business);
    });
    
    /*getAvailableTimeSlots('679021c44aeb1686eec0dc5a', '679021c44aeb1686eec0dc5a', '679021c44aeb1686eec0dc5a').then(response => {
      setAvailableTimeSlots(response.events);
    });*/

  }, []);

  return (
    <section className='py-24'>
      <div className='container'>
        {
          business 
          ? <div>
            {
              business.status === 'active'
              ? <div>
                  {
                    business.availableCalendar
                    ? <Form business={business} />
                    : <div>
                        <h1 className='text-4xl font-bold'>Салонът не предлага онлайн записване</h1>
                        <p>Моля, свържете се с нас за повече информация</p>
                      </div>
                  }
                </div>
              : business.status === 'inactive'
                ? <div>
                    <h1 className='text-4xl font-bold'>Салонът е затворен</h1>
                    <p>Моля, свържете се с нас за повече информация</p>
                  </div>
                : business.status === 'deleted'
                  ? <div>
                      <h1 className='text-4xl font-bold'>Салонът не съществува</h1>
                      <p>Моля, свържете се с нас за повече информация</p>
                    </div>
                  : null
            }
          </div>
          : <div>Зареждане...</div>
        }
      </div>
    </section>
  );
}
