import type { Story } from '@ladle/react';
import {
  Avatar,
  AvatarFallback,
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../src';

/** Rest the pointer on the link to see the card. */
export const Profile: Story = () => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <Button variant="link">@integr8</Button>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback>I8</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <h4 className="text-sm font-semibold">@integr8</h4>
          <p className="text-sm">Design system for every Integr8 Media app.</p>
          <p className="text-xs text-muted-foreground">Joined November 2026</p>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);
