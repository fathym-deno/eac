import { assert, assertEquals } from '../../test.deps.ts';
import { IoCContainer } from 'jsr:@fathym/ioc@0.0.14';
import { EaCJSRDFSHandlerResolver } from '../../../src/dfs/resolvers/EaCJSRDFSHandlerResolver.ts';
import type { EaCJSRDistributedFileSystemDetails } from '../../../src/dfs/_/EaCJSRDistributedFileSystemDetails.ts';

/**
 * Helper to retry network operations
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

Deno.test(
  {
    name: 'EaCJSRDFSHandlerResolver - passes FileRoot to handler',
    sanitizeResources: false,
  },
  async (t) => {
    const ioc = new IoCContainer();

    await t.step('resolver passes FileRoot and filters paths correctly', async () => {
      const jsrDfs: EaCJSRDistributedFileSystemDetails = {
        Type: 'JSR',
        Package: '@fathym/eac-applications',
        Version: '0.0.269-mcp-processor',
        FileRoot: '/src/steward/api/eac/',
        DefaultFile: 'index.ts',
        Extensions: ['ts'],
      };

      const handler = await withRetry(async () => {
        return await EaCJSRDFSHandlerResolver.Resolve(ioc, 'test-jsr', jsrDfs);
      });

      assert(handler, 'Should return a handler');

      const paths = await withRetry(async () => await handler!.LoadAllPaths());

      console.log('Paths from resolver-created handler:');
      paths.forEach((p: string) => console.log(`  ${p}`));

      // Verify FileRoot was passed - paths should be filtered and relativized
      assert(paths.length > 0, 'Should have paths');
      assert(
        paths.length < 50,
        `Should only have ~14 steward API files, not all 210+. Got ${paths.length}`,
      );

      // Paths should be relative to FileRoot (not include /src/steward/api/eac/)
      paths.forEach((p: string) => {
        assert(p.startsWith('/'), `Path should start with /: ${p}`);
        assert(
          !p.startsWith('/src/'),
          `Path should be relative to FileRoot, not absolute: ${p}`,
        );
      });

      // Should include expected files
      assert(
        paths.includes('/enterprise/index.ts'),
        `Should include /enterprise/index.ts. Got: ${paths.join(', ')}`,
      );
    });

    await t.step('resolver passes DefaultFile and Extensions', async () => {
      const jsrDfs: EaCJSRDistributedFileSystemDetails = {
        Type: 'JSR',
        Package: '@std/path',
        Version: '1.0.8',
        DefaultFile: 'mod.ts',
        Extensions: ['ts'],
      };

      const handler = await withRetry(async () => {
        return await EaCJSRDFSHandlerResolver.Resolve(ioc, 'test-jsr-std', jsrDfs);
      });

      assert(handler, 'Should return a handler');

      const paths = await withRetry(async () => await handler!.LoadAllPaths());

      // Should include mod.ts since no FileRoot filtering
      assert(
        paths.includes('/mod.ts'),
        `Should include /mod.ts. Got: ${paths.join(', ')}`,
      );
    });

    await t.step('resolver without FileRoot returns all package paths', async () => {
      const jsrDfs: EaCJSRDistributedFileSystemDetails = {
        Type: 'JSR',
        Package: '@std/assert',
        Version: '1.0.3',
        // No FileRoot - should return all paths
      };

      const handler = await withRetry(async () => {
        return await EaCJSRDFSHandlerResolver.Resolve(ioc, 'test-jsr-full', jsrDfs);
      });

      assert(handler, 'Should return a handler');

      const paths = await withRetry(async () => await handler!.LoadAllPaths());

      // Without FileRoot, paths should have their original format from manifest
      assert(paths.length > 0, 'Should have paths');
      assert(
        paths.includes('/mod.ts'),
        `Should include /mod.ts. Got: ${paths.join(', ')}`,
      );
    });
  },
);

Deno.test(
  {
    name: 'EaCJSRDFSHandlerResolver - error handling',
    sanitizeResources: false,
  },
  async (t) => {
    const ioc = new IoCContainer();

    await t.step('throws for missing Package', async () => {
      const jsrDfs: EaCJSRDistributedFileSystemDetails = {
        Type: 'JSR',
        Package: '', // Empty package
      };

      let error: Error | undefined;
      try {
        await EaCJSRDFSHandlerResolver.Resolve(ioc, 'test-jsr', jsrDfs);
      } catch (e) {
        error = e as Error;
      }

      assert(error, 'Should throw an error');
      assert(
        error!.message.includes('Package'),
        `Error should mention Package. Got: ${error!.message}`,
      );
    });

    await t.step('throws for invalid DFS type', async () => {
      const localDfs = {
        Type: 'Local',
        FileRoot: '/some/path',
      };

      let error: Error | undefined;
      try {
        // deno-lint-ignore no-explicit-any
        await EaCJSRDFSHandlerResolver.Resolve(ioc, 'test-local', localDfs as any);
      } catch (e) {
        error = e as Error;
      }

      assert(error, 'Should throw an error');
      assert(
        error instanceof Deno.errors.NotSupported,
        `Should throw NotSupported error. Got: ${error!.constructor.name}`,
      );
    });
  },
);
