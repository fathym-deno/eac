// import { EverythingAsCodeTags } from '../../src/fluent/EverythingAsCodeTags.ts';
// import { runTest } from '../test.deps.ts';

// Deno.test('Testing EverythingAsCodeTags', async (t) => {
//   // Test for simple object with basic tags
//   await t.step('Basic Object Tagging', () => {
//     type Example = {
//       key: {
//         '@Methods-handlers': { save: () => void };
//       };
//     };

//     type Result = EverythingAsCodeTags<Example>;
//     runTest<Result, { save: () => void }>(
//       { save: () => {} },
//       { save: () => {} }
//     );
//   });

//   // Test for union type tagging
//   await t.step('Union Type Tagging', () => {
//     type UnionType =
//       | {
//           key: {
//             '@Methods-handlers': { log: () => void };
//           };
//         }
//       | {
//           key: {
//             unrelatedKey: string;
//           };
//         };

//     type Result = EverythingAsCodeTags<UnionType>;
//     runTest<Result, { log: () => void } | {}>({ log: () => {} }, {});
//   });

//   // Test with Record type
//   await t.step('Record Type Tagging', () => {
//     type RecordType = Record<
//       string,
//       {
//         '@Methods-handlers': { execute: () => void };
//       }
//     >;

//     type Result = EverythingAsCodeTags<RecordType>;
//     runTest<Result, { execute: () => void }>(
//       { execute: () => {} },
//       { execute: () => {} }
//     );
//   });

//   // Test with complex nested structures
//   await t.step('Complex Nested Structure Tagging', () => {
//     type NestedType = {
//       firstLevel: {
//         secondLevel: {
//           '@Methods-handlers': { run: () => void };
//         };
//       };
//     };

//     type Result = EverythingAsCodeTags<NestedType>;
//     runTest<Result, { run: () => void }>({ run: () => {} }, { run: () => {} });
//   });

//   // Test with intersection types
//   await t.step('Intersection Type Tagging', () => {
//     type IntersectionType = {
//       key: {
//         '@Methods-handlers': { save: () => void };
//       };
//     } & {
//       key: {
//         unrelatedKey: number;
//       };
//     };

//     type Result = EverythingAsCodeTags<IntersectionType>;
//     runTest<Result, { save: () => void } & { unrelatedKey: number }>(
//       { save: () => {}, unrelatedKey: 42 },
//       { save: () => {}, unrelatedKey: 42 }
//     );
//   });

//   // Test for a non-existent handler key (should return empty object)
//   await t.step('Non-Existent Handler Tagging', () => {
//     type Example = {
//       key: {
//         '@Methods-handlers': { save: () => void };
//       };
//     };

//     // @ts-ignore Expecting non-existent key to return empty
//     type Result = EverythingAsCodeTags<Example>;
//     runTest<Result, {}>({}, {});
//   });
// });
