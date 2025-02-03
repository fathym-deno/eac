import { pathToPatternRegexes } from "./PathMatch.ts";

export function convertFilePathToPattern(
  filePath: string,
  defaultFile?: string,
): { patternText: string; priority: number }[] {
  let parts = filePath.split("/");

  const lastPart = parts.pop();

  if (lastPart && lastPart !== defaultFile) {
    parts.push(lastPart.replace(/\.\w+$/, ""));
  }

  let priority = parts.length * 10000000;

  if (parts.length === 1) {
    parts.push("");
  }

  const optionalParts: string[] = [];

  parts = parts.map((part) => {
    const partCheck = pathToPatternRegexes.find(([pc]) => pc.test(part));

    if (partCheck) {
      const [partPattern, partFix, partWeight, partType] = partCheck;

      priority -= 10000;

      priority += partWeight;

      part = part.replace(partPattern, partFix);

      if (partType === "optional") {
        optionalParts.push(part);
      }
    }

    if (part === ".") {
      part = "";
    }

    return part;
  });

  if (optionalParts.length > 1) {
    return optionalParts.map((_op, i) => {
      const usedOps = optionalParts.slice(0, i);

      const unusedOps = optionalParts.slice(i + 1);

      const workParts = parts
        .map((part) => {
          if (usedOps.includes(part)) {
            return part.replace("{/", "").replace("}?", "");
          } else if (unusedOps.includes(part)) {
            return "";
          } else {
            return part;
          }
        })
        .filter((wp) => wp);

      const patternText = ["", ...workParts].join("/").replace("/{/:", "{/:");

      priority += 100 * i;

      const p = priority;

      return { patternText, priority: p };
    });
  } else {
    const patternText = parts.join("/").replace("/{/:", "{/:");

    return [{ patternText, priority }];
  }
}
