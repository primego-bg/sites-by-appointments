'use client';

import Form from '@/components/form'
import { getBusiness } from '@/utils/request';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BusinessHeader } from '@/components/BusinessHeader';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/footer';
import { MdPhone } from 'react-icons/md';

import './globals.css';

export default function Home() {

 const { toast } = useToast();

 const [business, setBusiness] = useState<any>(null);
 const [loading, setLoading] = useState<boolean>(false);
 
 useEffect(() => {
    setLoading(true);
    const currentUrl = window.location.origin;
    const topLevelDomain = currentUrl.split('.').slice(-2).join('.');
    getBusiness(topLevelDomain).then(response => {
      setBusiness(response.business);
    }).catch(error => {
      toast({
        title: "Грешка",
        description: error.message,
        variant: "destructive"
      })
    }).finally(() => {
      setLoading(false);
    });
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
                            : <div className='px-4 mt-8'>
                                <h1 className='text-2xl font-bold'>Деактивирана система</h1>
                                <p className='mt-3 text-gray-700'>В момента не приемаме нови записвания за часове, тъй като онлайн системата е временно деактивирана. Може да запазите своя час на телефон:</p>
                                {
                                  business.locations.map((location: any, index: any) => 
                                      <a key={index} href={`tel:${location.phone}`} className="flex items-center mt-4 p-4 bg-zinc-100 rounded-sm shadow-sm hover:bg-gray-200 transition duration-200">
                                          {/* Icon */}
                                          <div className="flex-shrink-0 text-2xl mr-4">
                                              <MdPhone size={24} />
                                          </div>
                                          {/* Text Content */}
                                          <div>
                                              <p className="text-lg font-semibold text-gray-800">
                                              {location.name}
                                              </p>
                                              <p className="text-sm text-gray-600">
                                              {location.phone}
                                              </p>
                                          </div>
                                      </a>
                                  )
                                }
                              </div>
                          }
                        </div>
                      : business.status === 'inactive'
                        ? <div className='px-4 mt-8'>
                            <h1 className='text-2xl font-bold'>Деактивирана система</h1>
                            <p className='mt-3 text-gray-700'>Изглежда, че не приемаме нови записвания за часове към момента, тъй като системата е временно или трайно деактивирана.</p>
                            </div>
                        : business.status === 'deleted'
                          ? <div className='px-4 mt-8'>
                              <h1 className='text-2xl font-bold'>Деактивирана система</h1>
                              <p className='mt-3 text-gray-700'>Изглежда, че не приемаме нови записвания за часове към момента, тъй като системата е временно или трайно деактивирана.</p>
                            </div>
                          : null
                    }
                  </div>
                  : <div className="flex flex-row space-x-2 items-center justify-center">
                    <p className='text-zinc-800 mt-4'>Бизнесът не беше намерен</p>
                </div>
                }
              </>
          : <div className="flex flex-row space-x-2 items-center justify-center mt-4">
            <LoadingSpinner className="text-zinc-500" size={24} />
            <p className='text-zinc-800'>Зареждане</p>
        </div>
        }
      </div>
    </section>
  );
}
