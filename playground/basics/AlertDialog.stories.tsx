import type { Story } from '@ladle/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '../../src';

/** A destructive confirmation. Click outside does not close it; Esc and Cancel do. */
export const Destructive: Story = () => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">Delete project</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete the project?</AlertDialogTitle>
        <AlertDialogDescription>
          This deletes the project and its deployments. This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/** A plain confirmation with the primary action. */
export const Confirm: Story = () => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline">Publish</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Publish now?</AlertDialogTitle>
        <AlertDialogDescription>Everyone with the link will see the page.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Not yet</AlertDialogCancel>
        <AlertDialogAction>Publish</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
