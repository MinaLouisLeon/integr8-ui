import type { Story } from '@ladle/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../src';

const ITEMS = [
  { value: 'shipping', title: 'Shipping', body: 'Orders ship within two working days.' },
  { value: 'returns', title: 'Returns', body: 'Return any item within 30 days for a refund.' },
  { value: 'support', title: 'Support', body: 'Write to support any time; we answer in a day.' },
];

/** One section open at a time; the open one can be closed again. */
export const Single: Story = () => (
  <Accordion type="single" collapsible defaultValue="shipping" className="max-w-lg">
    {ITEMS.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.title}</AccordionTrigger>
        <AccordionContent>{item.body}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

/** Any number of sections open. */
export const Multiple: Story = () => (
  <Accordion type="multiple" defaultValue={['shipping', 'returns']} className="max-w-lg">
    {ITEMS.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.title}</AccordionTrigger>
        <AccordionContent>{item.body}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
