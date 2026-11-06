import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card';

describe('Card', () => {
  it('renders every part with its data-slot', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('card').dataset.slot).toBe('card');
    expect(screen.getByTestId('header').dataset.slot).toBe('card-header');
    expect(screen.getByText('Title').dataset.slot).toBe('card-title');
    expect(screen.getByText('Description').dataset.slot).toBe('card-description');
    expect(screen.getByText('Action').dataset.slot).toBe('card-action');
    expect(screen.getByText('Content').dataset.slot).toBe('card-content');
    expect(screen.getByText('Footer').dataset.slot).toBe('card-footer');
  });

  it('uses theme tokens and merges className', () => {
    render(<Card className="max-w-sm">Body</Card>);
    const card = screen.getByText('Body');

    expect(card.className).toContain('bg-card');
    expect(card.className).toContain('text-card-foreground');
    expect(card.className).toContain('max-w-sm');
  });

  it('gives the title the display font in the Integr8 theme', () => {
    render(<CardTitle>Hello</CardTitle>);
    expect(screen.getByText('Hello').className).toContain('integr8:font-display');
  });
});
