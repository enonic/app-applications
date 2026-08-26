import type {
  ComponentDescriptorType,
  ContentSchemaType,
  ContentTypeSchema,
  FormFragmentSchema,
  LayoutDescriptor,
  MixinSchema,
  PageDescriptor,
  PartDescriptor,
  SiteDescriptor,
} from '@enonic-types/lib-schema';
import { vi } from 'vitest';

export const listSchemas =
  vi.fn<
    (params: {
      application: string;
      type: ContentSchemaType;
    }) => ContentTypeSchema[] | FormFragmentSchema[] | MixinSchema[]
  >();

export const listComponents =
  vi.fn<
    (params: {
      application: string;
      type: ComponentDescriptorType;
    }) => PartDescriptor[] | LayoutDescriptor[] | PageDescriptor[]
  >();

export const getSite = vi.fn<(params: { application: string }) => SiteDescriptor | null>();
