import type { Story } from '@ladle/react';
import { useId } from 'react';
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '../../src';

/** A login card with every part. CardTitle uses Unbounded in the Integr8 theme. */
export const Login: Story = () => {
  const id = useId();
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to log in.</CardDescription>
        <CardAction>
          <Button variant="link">Sign up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input id={`${id}-email`} type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${id}-password`}>Password</Label>
            <Input id={`${id}-password`} type="password" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Login</Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
};

/** A simple card with borders between sections. */
export const Bordered: Story = () => (
  <Card className="w-full max-w-sm">
    <CardHeader className="border-b">
      <CardTitle>Deployments</CardTitle>
      <CardDescription>Last 24 hours</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm">12 successful, 1 failed.</p>
    </CardContent>
    <CardFooter className="border-t">
      <Button size="sm" variant="secondary">
        View all
      </Button>
    </CardFooter>
  </Card>
);
