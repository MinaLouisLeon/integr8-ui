import type { Story } from '@ladle/react';
import { GradientText } from '../../src';

/** The violet → cyan → lime gradient. Switch to Integr8 or Integr8 Light to see it. */
export const Default: Story = () => (
  <div className="grid gap-6">
    <h1 className="text-5xl font-extrabold">
      Build the future, <GradientText>integrated</GradientText>.
    </h1>
    <p className="text-muted-foreground">
      In the Light and Dark themes the gradient is off and the text uses the normal color.
    </p>
  </div>
);

/** `asChild` on a heading, and a custom angle. */
export const AsChildAndAngle: Story = () => (
  <div className="grid gap-4">
    <GradientText asChild>
      <h2 className="text-4xl font-semibold">Integr8 Workbench</h2>
    </GradientText>
    <GradientText asChild angle="135deg">
      <h2 className="text-4xl font-semibold">135 degrees</h2>
    </GradientText>
    <GradientText angle="180deg" className="text-6xl font-extrabold">
      Top to bottom
    </GradientText>
  </div>
);
