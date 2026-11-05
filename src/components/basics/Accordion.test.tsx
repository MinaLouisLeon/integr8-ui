import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="one" className="item">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent className="body">First body</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second</AccordionTrigger>
        <AccordionContent>Second body</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('opens and closes sections from the trigger', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const first = screen.getByRole('button', { name: 'First' });

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('First body')).toBeNull();

    await user.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('First body').className).toContain('body');

    await user.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps one section open at a time in single mode', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'First' }));
    await user.click(screen.getByRole('button', { name: 'Second' }));

    expect(screen.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(screen.getByText('Second body')).toBeTruthy();
  });

  it('sets data-slot and merges className', () => {
    const { container } = render(<Example />);
    const item = container.querySelector('[data-slot="accordion-item"]');

    expect(container.querySelector('[data-slot="accordion"]')).not.toBeNull();
    expect(item?.className).toContain('item');
    expect(item?.className).toContain('border-b');
  });
});
