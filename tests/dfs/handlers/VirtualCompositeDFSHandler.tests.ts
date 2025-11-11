import {
  EaCDistributedFileSystemDetails,
  EaCVirtualCompositeDistributedFileSystemDetails,
} from "../../../src/dfs/_/.exports.ts";
import {
  DFSFileHandler,
  DFSFileInfo,
} from "../../../src/dfs/handlers/.exports.ts";
import { VirtualCompositeDFSHandler } from "../../../src/dfs/handlers/VirtualCompositeDFSHandler.ts";
import { assertEquals, assertRejects, assertThrows } from "../../test.deps.ts";

type MockDetails = EaCDistributedFileSystemDetails<"Mock">;

const encoder = new TextEncoder();

class MockDFSFileHandler extends DFSFileHandler<MockDetails> {
  public removed: string[] = [];

  constructor(
    dfsLookup: string,
    details: MockDetails,
    private readonly files: Map<string, string>,
    private readonly supportsRemove = true,
  ) {
    super(dfsLookup, details);
  }

  public override get Root(): string {
    return "./";
  }

  public override async GetFileInfo(
    filePath: string,
  ): Promise<DFSFileInfo | undefined> {
    const normalized = this.normalize(filePath);
    const contents = this.files.get(normalized);

    if (!contents) {
      return undefined;
    }

    return {
      Path: filePath,
      ImportPath: filePath,
      Contents: this.createStream(contents),
    };
  }

  public override async LoadAllPaths(): Promise<string[]> {
    return Array.from(this.files.keys()).map((key) => `./${key}`);
  }

  public override async RemoveFile(filePath: string): Promise<void> {
    const normalized = this.normalize(filePath);

    if (!this.files.has(normalized)) {
      if (this.supportsRemove) {
        throw new Deno.errors.NotFound(
          `File '${normalized}' not found in mock DFS handler.`,
        );
      }

      throw new Deno.errors.NotSupported("Removal not supported.");
    }

    this.removed.push(normalized);
    this.files.delete(normalized);
  }

  public override async WriteFile(
    filePath: string,
    _revision: string,
    stream: ReadableStream<Uint8Array>,
  ): Promise<void> {
    const normalized = this.normalize(filePath);
    const buffer = await new Response(stream).text();
    this.files.set(normalized, buffer);
  }

  private createStream(contents: string): ReadableStream<Uint8Array> {
    return ReadableStream.from([encoder.encode(contents)]);
  }

  private normalize(filePath: string): string {
    return filePath.replace(/^(\.\/|\/)+/, "");
  }
}

function toStream(value: string): ReadableStream<Uint8Array> {
  return ReadableStream.from([encoder.encode(value)]);
}

async function streamToText(stream: ReadableStream<Uint8Array> | undefined) {
  if (!stream) return "";
  return await new Response(stream).text();
}

Deno.test("VirtualCompositeDFSHandler overlays and fallbacks", async (t) => {
  const baseDetailsA: MockDetails = { Type: "Mock", Name: "Base-A" };
  const baseDetailsB: MockDetails = { Type: "Mock", Name: "Base-B" };

  const baseHandlerA = new MockDFSFileHandler(
    "base-a",
    baseDetailsA,
    new Map([
      ["shared.ts", "base-a shared"],
      ["only-a.ts", "base-a only"],
    ]),
  );

  const baseHandlerB = new MockDFSFileHandler(
    "base-b",
    baseDetailsB,
    new Map([
      ["shared.ts", "base-b shared"],
      ["only-b.ts", "base-b only"],
    ]),
    false,
  );

  const details: EaCVirtualCompositeDistributedFileSystemDetails = {
    Type: "VirtualComposite",
    BaseDFSLookups: ["base-a", "base-b"],
    BaseDFSDetails: {
      "base-a": baseDetailsA,
      "base-b": baseDetailsB,
    },
  };

  const handler = new VirtualCompositeDFSHandler(
    "virtual",
    details,
    [baseHandlerA, baseHandlerB],
  );

  const revision = "rev-1";

  await handler.WriteFile("./shared.ts", revision, toStream("overlay shared"));
  await handler.WriteFile(
    "./overlay-only.ts",
    revision,
    toStream("overlay only"),
  );

  await t.step("Overlay files take precedence", async () => {
    const fileInfo = await handler.GetFileInfo("./shared.ts", revision);
    assertEquals(await streamToText(fileInfo?.Contents), "overlay shared");
  });

  await t.step(
    "Falls back to first base handler when overlay missing",
    async () => {
      const fileInfo = await handler.GetFileInfo("./only-a.ts", revision);
      assertEquals(await streamToText(fileInfo?.Contents), "base-a only");
    },
  );

  await t.step(
    "Falls back to later base handlers when previous misses",
    async () => {
      const fileInfo = await handler.GetFileInfo("./only-b.ts", revision);
      assertEquals(await streamToText(fileInfo?.Contents), "base-b only");
    },
  );

  await t.step(
    "LoadAllPaths returns union of overlay and base files",
    async () => {
      const paths = await handler.LoadAllPaths(revision);
      const sorted = [...paths].sort();
      assertEquals(
        sorted,
        [
          "./only-a.ts",
          "./only-b.ts",
          "./overlay-only.ts",
          "./shared.ts",
        ].sort(),
      );
    },
  );

  await t.step(
    "RemoveFile removes overlays without hitting base handlers",
    async () => {
      await handler.RemoveFile("./overlay-only.ts", revision);
      const fileInfo = await handler.GetFileInfo("./overlay-only.ts", revision);
      assertEquals(fileInfo, undefined);
      assertEquals(baseHandlerA.removed.length, 0);
    },
  );

  await t.step(
    "Removing non-overlay paths delegates to base handlers in order",
    async () => {
      await handler.RemoveFile("./only-a.ts", revision);
      assertEquals(baseHandlerA.removed.includes("only-a.ts"), true);
    },
  );

  await t.step(
    "Removing missing files throws when base handlers cannot handle",
    async () => {
      await assertRejects(
        () => handler.RemoveFile("./unknown.ts", revision),
        Deno.errors.NotSupported,
      );
    },
  );
});
