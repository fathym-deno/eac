import { FetchDFSFileHandler } from '../../../src/dfs/handlers/.exports.ts';
import { assertEquals, assertRejects } from '../../test.deps.ts';

/**
 * Test Suite for FetchDFSFileHandler
 */
Deno.test('FetchDFSFileHandler Tests', async (t) => {
  const mockRoot = 'https://example.com/assets';
  const mockPathResolver = (filePath: string) => `${mockRoot}${filePath}`;
  const dfsHandler = new FetchDFSFileHandler(mockRoot, mockPathResolver);

  const testFilePath = '/sample.txt';
  const nestedFilePath = '/nested/dir/file.json';
  const missingFile = '/missing.txt';
  const validFilePaths = [testFilePath, nestedFilePath];
  const fileContents = 'Hello, Fetch DFS!';

  // Save the original fetch function
  const originalFetch = globalThis.fetch;

  // Override fetch for this test
  globalThis.fetch = async (
    input: RequestInfo | URL,
    _init?: RequestInit
  ): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();

    if (validFilePaths.some((p) => url.endsWith(p))) {
      return new Response(fileContents, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new Response('Not Found', { status: 404 });
  };

  try {
    await t.step('GetFileInfo should return valid file info', async () => {
      for (const filePath of validFilePaths) {
        const fileInfo = await dfsHandler.GetFileInfo(filePath, 'revision');
        assertEquals(fileInfo?.Path, filePath);
        assertEquals(fileInfo?.Contents instanceof ReadableStream, true);
      }
    });

    await t.step(
      'GetFileInfo should return undefined for missing file',
      async () => {
        const fileInfo = await dfsHandler.GetFileInfo(missingFile, 'revision');
        assertEquals(fileInfo, undefined);
      }
    );

    await t.step('LoadAllPaths should throw NotSupported error', async () => {
      await assertRejects(
        () => dfsHandler.LoadAllPaths('revision'),
        Deno.errors.NotSupported,
        'Retrieval of fetch paths is not supported.'
      );
    });

    await t.step('RemoveFile should throw NotSupported error', async () => {
      await assertRejects(
        () => dfsHandler.RemoveFile(testFilePath, 'revision'),
        Deno.errors.NotSupported,
        'File removal is not supported.'
      );
    });

    await t.step('WriteFile should throw NotSupported error', async () => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Sample Data'));
          controller.close();
        },
      });

      await assertRejects(
        () => dfsHandler.WriteFile(testFilePath, 'revision', stream),
        Deno.errors.NotSupported,
        'File writing is not supported.'
      );
    });

    await t.step('Valid file paths should always start with /', async () => {
      for (const filePath of validFilePaths) {
        assertEquals(
          filePath.startsWith('/'),
          true,
          `File path should start with '/', but got: ${filePath}`
        );
      }
    });
  } finally {
    // Restore the original fetch function after tests
    globalThis.fetch = originalFetch;
  }
});
