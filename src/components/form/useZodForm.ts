'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from 'react-hook-form';
import type { z } from 'zod';

/** Options for {@link useZodForm}: every `useForm` option except `resolver`. */
export type UseZodFormOptions<TSchema extends z.ZodType<FieldValues, FieldValues>> = Omit<
  UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>,
  'resolver'
>;

/**
 * `useForm` with a zod schema as its resolver. Values are typed from the schema; the
 * submit handler receives the parsed output.
 *
 * @example
 * ```tsx
 * const schema = z.object({ email: z.email() });
 * const form = useZodForm(schema, { defaultValues: { email: '' } });
 * ```
 */
export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: UseZodFormOptions<TSchema>,
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>> {
  // zodResolver cannot infer input/output types from a generic schema, so name them here.
  const resolver = zodResolver(schema) as unknown as Resolver<
    z.input<TSchema>,
    unknown,
    z.output<TSchema>
  >;
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({ ...options, resolver });
}
