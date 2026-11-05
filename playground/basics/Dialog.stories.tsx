import type { Story } from '@ladle/react';
import { useId } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '../../src';

/** A form in a dialog. Focus stays inside; Esc or the × closes it. */
export const EditProfile: Story = () => {
  const id = useId();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile. Click save when done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input id={`${id}-name`} defaultValue="Mina Louis" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${id}-username`}>Username</Label>
            <Input id={`${id}-username`} defaultValue="@mina" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** No × button: the footer is the only way out (besides Esc). */
export const NoCloseButton: Story = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Share link</Button>
    </DialogTrigger>
    <DialogContent showCloseButton={false} className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share link</DialogTitle>
        <DialogDescription>Anyone with this link can view the page.</DialogDescription>
      </DialogHeader>
      <Input aria-label="Link" readOnly defaultValue="https://integr8-media.com/s/abc123" />
      <DialogFooter>
        <DialogClose asChild>
          <Button>Done</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
