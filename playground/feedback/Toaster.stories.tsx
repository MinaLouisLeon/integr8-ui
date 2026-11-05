import type { Story } from '@ladle/react';
import { Button, Toaster, toast } from '../../src';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Every toast type. Colors follow the theme switcher in the toolbar. */
export const Types: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" onClick={() => toast('Event created')}>
      Default
    </Button>
    <Button
      variant="outline"
      onClick={() => toast('Event created', { description: 'Monday, 9:00 in Room 2.' })}
    >
      With description
    </Button>
    <Button variant="outline" onClick={() => toast.success('Profile saved')}>
      Success
    </Button>
    <Button variant="outline" onClick={() => toast.info('A new version is available')}>
      Info
    </Button>
    <Button variant="outline" onClick={() => toast.warning('Disk is almost full')}>
      Warning
    </Button>
    <Button variant="outline" onClick={() => toast.error('Upload failed')}>
      Error
    </Button>
    <Button
      variant="outline"
      onClick={() =>
        toast('File deleted', { action: { label: 'Undo', onClick: () => toast('Restored') } })
      }
    >
      With action
    </Button>
    <Button
      variant="outline"
      onClick={() =>
        toast.promise(wait(2000), {
          loading: 'Saving…',
          success: 'Saved',
          error: 'Could not save',
        })
      }
    >
      Promise
    </Button>
    <Toaster />
  </div>
);

/** Positions and the close button. */
export const Position: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" onClick={() => toast('Shown at the top center')}>
      Show
    </Button>
    <Toaster position="top-center" closeButton />
  </div>
);
