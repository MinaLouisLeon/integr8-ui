import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders a labelled nav with links, separators and the current page', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="separator" />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    expect(screen.getByText('Settings').getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('More').className).toContain('sr-only');

    const separator = screen.getByTestId('separator');
    expect(separator.getAttribute('aria-hidden')).toBe('true');
    expect(separator.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('/').dataset.slot).toBe('breadcrumb-separator');
  });

  it('renders a router link through asChild', () => {
    render(
      <BreadcrumbLink asChild className="extra">
        <a href="/projects">Projects</a>
      </BreadcrumbLink>,
    );
    const link = screen.getByRole('link', { name: 'Projects' });

    expect(link.dataset.slot).toBe('breadcrumb-link');
    expect(link.className).toContain('extra');
  });
});
