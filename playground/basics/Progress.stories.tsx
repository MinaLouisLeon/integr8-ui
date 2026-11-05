import type { Story } from '@ladle/react';
import { type JSX, useEffect, useState } from 'react';
import { Progress } from '../../src';

/** Fixed values, including 0, 100 and unknown. */
export const Values: Story = () => (
  <div className="grid max-w-md gap-4">
    <Progress value={0} aria-label="Zero" />
    <Progress value={33} aria-label="A third" />
    <Progress value={3} max={4} aria-label="Three of four steps" />
    <Progress value={100} aria-label="Done" />
    <Progress value={null} aria-label="Unknown" />
  </div>
);

function Running(): JSX.Element {
  const [value, setValue] = useState(10);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : current + 10));
    }, 600);
    return () => window.clearInterval(timer);
  }, []);
  return <Progress value={value} aria-label="Upload" className="max-w-md" />;
}

/** A value that changes over time. */
export const Animated: Story = () => <Running />;
