'use client';

import Form from '@/components/form'
import getBusiness from '@/utils/request';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const currentUrl = window.location.origin;
    const topLevelDomain = currentUrl.split('.').slice(-2).join('.');
    //console.log(`%c${topLevelDomain}`, 'font-size: 2rem; color: #f00');
    getBusiness(topLevelDomain).then(response => {
      const business = response.business;
      
      if(business.URLpostfix == "kerelski") {
        console.log("response.business");
      }
    });

  }, []);

  return (
    <section className='py-24'>
      <div className='container'>
        <Form />
      </div>
    </section>
  );
}
