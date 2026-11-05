import type { Story } from '@ladle/react';
import { ArrowRightIcon, MailIcon, PlusIcon } from 'lucide-react';
import { Button, type ButtonSize, type ButtonVariant, Spinner } from '../../src';

const VARIANTS: ButtonVariant[] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
];
const SIZES: ButtonSize[] = ['sm', 'default', 'lg'];

/** Every variant. In the Integr8 theme the buttons are pills. */
export const Variants: Story = () => (
  <div className="flex flex-wrap items-center gap-3">
    {VARIANTS.map((variant) => (
      <Button key={variant} variant={variant}>
        {variant}
      </Button>
    ))}
  </div>
);

/** Sizes, including the square icon sizes. */
export const Sizes: Story = () => (
  <div className="flex flex-wrap items-center gap-3">
    {SIZES.map((size) => (
      <Button key={size} size={size}>
        Size {size}
      </Button>
    ))}
    <Button size="icon-sm" variant="outline" aria-label="Add">
      <PlusIcon />
    </Button>
    <Button size="icon" variant="outline" aria-label="Add">
      <PlusIcon />
    </Button>
    <Button size="icon-lg" variant="outline" aria-label="Add">
      <PlusIcon />
    </Button>
  </div>
);

/** Icons, loading and disabled states. */
export const States: Story = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>
      <MailIcon /> Login with email
    </Button>
    <Button variant="secondary">
      Next <ArrowRightIcon />
    </Button>
    <Button disabled>
      <Spinner /> Saving
    </Button>
    <Button variant="outline" disabled>
      Disabled
    </Button>
    <Button variant="outline" aria-invalid>
      Invalid
    </Button>
  </div>
);

/** `asChild` renders a link that looks like a button. */
export const AsChild: Story = () => (
  <Button asChild>
    <a href="#docs">Read the docs</a>
  </Button>
);
