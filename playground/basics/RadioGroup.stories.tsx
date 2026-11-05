import type { Story } from '@ladle/react';
import { useId } from 'react';
import { Label, RadioGroup, RadioGroupItem } from '../../src';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

/** Pick one plan. Arrow keys move between options. */
export const Plans: Story = () => {
  const id = useId();
  return (
    <RadioGroup defaultValue="pro" aria-label="Plan">
      {PLANS.map((plan) => (
        <div key={plan.value} className="flex items-center gap-2">
          <RadioGroupItem value={plan.value} id={`${id}-${plan.value}`} />
          <Label htmlFor={`${id}-${plan.value}`}>{plan.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};

/** Invalid options and a disabled one. */
export const States: Story = () => {
  const id = useId();
  return (
    <RadioGroup aria-label="Size">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="s" id={`${id}-s`} aria-invalid />
        <Label htmlFor={`${id}-s`}>Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="m" id={`${id}-m`} aria-invalid />
        <Label htmlFor={`${id}-m`}>Medium</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="l" id={`${id}-l`} disabled />
        <Label htmlFor={`${id}-l`}>Large (sold out)</Label>
      </div>
    </RadioGroup>
  );
};
