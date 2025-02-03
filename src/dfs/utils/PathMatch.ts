import { EaCRuntimeHandlerPipeline } from "./.deps.ts";

export type PathMatch = {
  Handlers: EaCRuntimeHandlerPipeline;

  Path: string;

  Pattern: URLPattern;

  PatternText: string;

  Priority: number;
};

export const pathToPatternRegexes: [
  RegExp,
  string,
  number,
  "optional" | "expand" | "segment",
][] = [
  // Handle [[optional]]
  [/\[\[(.*?)\]\]/g, "{/:$1}?", 2, "optional"],
  // Handle [...ident]
  [/\[\.\.\.(.*?)\]/g, ":$1*", -1000, "expand"],
  // Handle [segment]
  [/\[(.*?)\]/g, ":$1", 3, "segment"],
];
