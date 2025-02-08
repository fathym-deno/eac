import {
  EaCDenoKVDistributedFileSystemDetails,
  isEaCDenoKVDistributedFileSystemDetails,
  parseEaCDenoKVDistributedFileSystemDetails,
} from '../../../src/dfs/_/EaCDenoKVDistributedFileSystemDetails.ts';
import { assertEquals, assertThrows } from '../../test.deps.ts';

Deno.test('EaCDenoKVDistributedFileSystemDetails Tests', async (t) => {
  const validDenoKVDFS: EaCDenoKVDistributedFileSystemDetails = {
    Type: 'DenoKV',
    DatabaseLookup: 'deno-kv-db',
    FileRoot: '/data',
    SegmentPath: '/segment',
    RootKey: ['kv', 'root', 1],
    Name: 'Deno KV DFS',
    Description: 'A DFS stored in Deno KV.',
  };

  const validDenoKVMinimal: EaCDenoKVDistributedFileSystemDetails = {
    Type: 'DenoKV',
    DatabaseLookup: 'deno-kv-db',
    FileRoot: '/data',
    RootKey: ['kv', 'root', 1],
  };

  const invalidDenoKVDFSs = [
    42,
    null,
    'invalid',
    {
      Type: 'RandomDFS',
      DatabaseLookup: 'db',
      FileRoot: '/data',
      RootKey: ['key'],
    }, // Wrong type
    {
      DatabaseLookup: 123,
      Type: 'DenoKV',
      FileRoot: '/data',
      RootKey: ['key'],
    }, // Wrong type
    { FileRoot: 42, Type: 'DenoKV', DatabaseLookup: 'db', RootKey: ['key'] }, // Wrong type
    {
      RootKey: 'not an array',
      Type: 'DenoKV',
      DatabaseLookup: 'db',
      FileRoot: '/data',
    }, // Wrong type
    {
      RootKey: [true],
      Type: 'DenoKV',
      DatabaseLookup: 'db',
      FileRoot: '/data',
    }, // Wrong element type
  ];

  await t.step('Valid values should pass', () => {
    assertEquals(isEaCDenoKVDistributedFileSystemDetails(validDenoKVDFS), true);
    assertEquals(
      isEaCDenoKVDistributedFileSystemDetails(validDenoKVMinimal),
      true
    );
  });

  await t.step('Invalid values should fail', () => {
    for (const invalid of invalidDenoKVDFSs) {
      assertEquals(isEaCDenoKVDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    'parseEaCDenoKVDistributedFileSystemDetails should return correct values for valid inputs',
    () => {
      assertEquals(
        parseEaCDenoKVDistributedFileSystemDetails(validDenoKVDFS),
        validDenoKVDFS
      );
      assertEquals(
        parseEaCDenoKVDistributedFileSystemDetails(validDenoKVMinimal),
        validDenoKVMinimal
      );
    }
  );

  await t.step(
    'parseEaCDenoKVDistributedFileSystemDetails should throw for invalid inputs',
    () => {
      for (const invalid of invalidDenoKVDFSs) {
        assertThrows(() => parseEaCDenoKVDistributedFileSystemDetails(invalid));
      }
    }
  );
});
