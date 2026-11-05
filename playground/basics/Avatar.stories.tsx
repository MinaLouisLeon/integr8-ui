import type { Story } from '@ladle/react';
import { Avatar, AvatarFallback, AvatarImage } from '../../src';

// An inline SVG, so the story works offline and the smoke test sees no network errors.
const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#c6ff3d"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>',
)}`;

/** With a picture, with initials only, and in larger sizes. */
export const Avatars: Story = () => (
  <div className="flex items-center gap-4">
    <Avatar>
      <AvatarImage src={PICTURE} alt="Gradient" />
      <AvatarFallback>IM</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>ML</AvatarFallback>
    </Avatar>
    <Avatar className="size-12">
      <AvatarImage src={PICTURE} alt="Gradient" />
      <AvatarFallback>IM</AvatarFallback>
    </Avatar>
    <Avatar className="size-12 rounded-lg">
      <AvatarFallback className="rounded-lg">AB</AvatarFallback>
    </Avatar>
  </div>
);

/** Overlapping avatars for a team. */
export const Stack: Story = () => (
  <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
    <Avatar>
      <AvatarImage src={PICTURE} alt="Gradient" />
      <AvatarFallback>IM</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>ML</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>+3</AvatarFallback>
    </Avatar>
  </div>
);
