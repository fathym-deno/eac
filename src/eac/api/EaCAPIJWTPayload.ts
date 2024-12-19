export type EaCAPIJWTPayload = Record<string, unknown> & {
  EnterpriseLookup?: string;

  JWT?: string;

  Username?: string;
};
