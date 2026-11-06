import type { Story } from '@ladle/react';
import { Button, GradientText, GrainOverlay } from '../../src';

/**
 * Grain over a hero section (`cover="parent"`). Visible only in the Integr8 themes and not
 * rendered when the OS asks for reduced motion.
 */
export const Section: Story = () => (
  <section className="relative grid min-h-80 place-items-center overflow-hidden rounded-xl border bg-card p-12 text-center">
    <GrainOverlay cover="parent" opacity={0.12} />
    <div className="relative grid gap-4">
      <h1 className="text-5xl font-extrabold">
        Media, <GradientText>integrated</GradientText>.
      </h1>
      <div>
        <Button>Get started</Button>
      </div>
    </div>
  </section>
);

/** Animated grain over the whole window. */
export const ViewportAnimated: Story = () => (
  <div className="grid gap-4">
    <GrainOverlay animated />
    <p>The grain covers the whole window and moves like film. It never blocks clicks:</p>
    <div>
      <Button variant="outline">Still clickable</Button>
    </div>
  </div>
);
