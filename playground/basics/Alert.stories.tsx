import type { Story } from '@ladle/react';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../src';

/** The five variants, with icons. */
export const Variants: Story = () => (
  <div className="grid max-w-xl gap-4">
    <Alert>
      <InfoIcon />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>You can add components to your app using the registry.</AlertDescription>
    </Alert>
    <Alert variant="info">
      <InfoIcon />
      <AlertTitle>New version</AlertTitle>
      <AlertDescription>Version 1.2 is ready to install.</AlertDescription>
    </Alert>
    <Alert variant="success">
      <CircleCheckIcon />
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>Your changes are live.</AlertDescription>
    </Alert>
    <Alert variant="warning">
      <TriangleAlertIcon />
      <AlertTitle>Low disk space</AlertTitle>
      <AlertDescription>Less than 1 GB left on the agent.</AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>Upload failed</AlertTitle>
      <AlertDescription>
        <p>The file is larger than 10 MB.</p>
        <p>Try a smaller file.</p>
      </AlertDescription>
    </Alert>
  </div>
);

/** Without an icon, the text uses the full width. */
export const NoIcon: Story = () => (
  <Alert className="max-w-xl">
    <AlertTitle>No icon</AlertTitle>
    <AlertDescription>The grid collapses its icon column.</AlertDescription>
  </Alert>
);
