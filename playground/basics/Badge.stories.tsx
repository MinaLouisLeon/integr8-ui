import type { Story } from '@ladle/react';
import { CheckIcon } from 'lucide-react';
import { Badge, type BadgeVariant } from '../../src';

const VARIANTS: BadgeVariant[] = [
  'default',
  'secondary',
  'outline',
  'destructive',
  'success',
  'warning',
  'info',
];

/** Every variant. Pills in the Integr8 theme. */
export const Variants: Story = () => (
  <div className="flex flex-wrap items-center gap-2">
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant}>
        {variant}
      </Badge>
    ))}
  </div>
);

/** With an icon, and as a link. */
export const WithIconAndLink: Story = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="success">
      <CheckIcon /> Verified
    </Badge>
    <Badge asChild variant="outline">
      <a href="#inbox">Inbox · 3</a>
    </Badge>
  </div>
);
