import type { Story } from '@ladle/react';
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  type SheetSide,
  SheetTitle,
  SheetTrigger,
} from '../../src';

const SIDES: SheetSide[] = ['top', 'right', 'bottom', 'left'];

/** One sheet per side. */
export const Sides: Story = () => (
  <div className="flex flex-wrap gap-3">
    {SIDES.map((side) => (
      <Sheet key={side}>
        <SheetTrigger asChild>
          <Button variant="outline">{side}</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Opens from the {side}.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4">
            <div className="grid gap-2">
              <Label htmlFor={`sheet-name-${side}`}>Name</Label>
              <Input id={`sheet-name-${side}`} defaultValue="Mina Louis" />
            </div>
          </div>
          <SheetFooter>
            <Button>Save changes</Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    ))}
  </div>
);
