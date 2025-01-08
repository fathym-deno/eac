/**
 * The EaC Application Resolver Configuration.
 */

export type RouteResolverConfiguration = {
  /** The allowed HTTP methods for the resolver. */
  AllowedMethods?: string[];

  /** Whether the resolver is private. */
  IsPrivate?: boolean;

  /** Whether the resolver should trigger the sign-in flow. */
  IsTriggerSignIn?: boolean;

  /** The path pattern for the resolver. */
  PathPattern: string;

  /** The resolver's priority. */
  Priority: number;

  /** The regular expression for matching user agents. */
  UserAgentRegex?: string;
};
