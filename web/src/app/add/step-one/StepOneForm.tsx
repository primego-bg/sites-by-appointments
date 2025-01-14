'use client';
import Input from '@/components/Input';
import { useFormState } from 'react-dom';
import { stepOneFormAction } from './actions';
import { FormErrors } from '@/types';
import SubmitButton from '@/components/SubmitButton';
import Select from '@/components/Select';

const initialState: FormErrors = {};

export default function StepOneForm() {
  const [serverErrors, formAction] = useFormState(
    stepOneFormAction,
    initialState
  );

  return (
    <form action={formAction}>
      <div>
        <Select
          label="Location"
          id="location"
          required
          errorMsg={serverErrors?.location} 
        />
        <Select
          label="Select specialist"
          id="specialist"
          required
          errorMsg={serverErrors?.specialist} 
        />
        <Select
          label="Select service"
          id="service"
          required
          errorMsg={serverErrors?.service} 
        />
        <SubmitButton text="Continue" />
      </div>
    </form>
  );
}
