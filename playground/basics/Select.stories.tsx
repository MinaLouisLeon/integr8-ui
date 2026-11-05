import type { Story } from '@ladle/react';
import { useId } from 'react';
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../../src';

/** Groups, a separator and a disabled item. */
export const Default: Story = () => {
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Fruit</Label>
      <Select>
        <SelectTrigger id={id} className="w-48">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="leek" disabled>
              Leek (out of stock)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

const TIMEZONES = Array.from({ length: 27 }, (_, index) => {
  const offset = index - 12;
  return offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
});

/** A long list scrolls, with scroll buttons; small trigger; invalid state. */
export const LongAndSmall: Story = () => (
  <div className="flex flex-wrap items-start gap-4">
    <Select defaultValue="UTC+2">
      <SelectTrigger size="sm" className="w-36" aria-label="Time zone">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TIMEZONES.map((zone) => (
          <SelectItem key={zone} value={zone}>
            {zone}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select>
      <SelectTrigger aria-invalid className="w-48" aria-label="Required">
        <SelectValue placeholder="Required" />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        <SelectItem value="a">Option A</SelectItem>
        <SelectItem value="b">Option B</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
