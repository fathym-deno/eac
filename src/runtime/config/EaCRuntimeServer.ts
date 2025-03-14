export type EaCRuntimeServer = {
  Lookup: string;

  PortRange?: number;

  TLS?: Deno.TlsCertifiedKeyPem;
} & Partial<Deno.TcpListenOptions>;
