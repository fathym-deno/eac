// import { ESMFetchDFSFileHandler } from "../../../src/dfs/handlers/.exports.ts";
// import { assertEquals, assertRejects } from "../../test.deps.ts";

// /**
//  * Test Suite for ESMFetchDFSFileHandler
//  */
// Deno.test("ESMFetchDFSFileHandler Tests", async (t) => {
//   // ✅ Use a real ESM package from Skypack CDN
//   const packageURL = "https://cdn.skypack.dev/lodash-es@4.17.21/";
//   const entryPoints = ["lodash.js"]; // Lodash ES entry point

//   const handlerWithDeps = new ESMFetchDFSFileHandler(
//     packageURL,
//     entryPoints,
//     true,
//   );
//   const handlerWithoutDeps = new ESMFetchDFSFileHandler(
//     packageURL,
//     entryPoints,
//     false,
//   );

//   await t.step(
//     "LoadAllPaths should resolve all module paths (including dependencies)",
//     async () => {
//       const paths = await handlerWithDeps.LoadAllPaths("revision");

//       console.log("Resolved Paths with Dependencies:", paths);
//       assertEquals(paths.some((p) => p.includes("lodash")), true);
//       assertEquals(paths.length > 1, true, "Should include dependencies.");
//     },
//   );

//   await t.step(
//     "LoadAllPaths should resolve entry points only (excluding dependencies)",
//     async () => {
//       const paths = await handlerWithoutDeps.LoadAllPaths("revision");

//       console.log("Resolved Paths without Dependencies:", paths);
//       assertEquals(paths.length, 1, "Should only return entry points.");
//       assertEquals(paths[0], `./${entryPoints[0]}`);
//     },
//   );

//   await t.step(
//     "LoadAllPaths should correctly resolve import maps (if applicable)",
//     async () => {
//       const handlerWithImportMaps = new ESMFetchDFSFileHandler(
//         "https://cdn.skypack.dev/",
//         ["lodash-es@4.17.21/lodash.js"],
//         false,
//       );

//       const paths = await handlerWithImportMaps.LoadAllPaths("revision");

//       console.log("Resolved Paths with Import Maps:", paths);
//       assertEquals(paths.some((p) => p.includes("lodash")), true);
//     },
//   );

//   await t.step(
//     "LoadAllPaths should correctly resolve local file URLs",
//     async () => {
//       const localHandler = new ESMFetchDFSFileHandler(
//         "file:///",
//         ["mod.ts"],
//         false,
//       );
//       const paths = await localHandler.LoadAllPaths("revision");

//       console.log("Resolved Local Paths:", paths);
//       assertEquals(paths.length, 1);
//       assertEquals(paths[0], "./mod.ts");
//     },
//   );

//   await t.step(
//     "LoadAllPaths should throw an error when entry points are empty",
//     async () => {
//       const emptyHandler = new ESMFetchDFSFileHandler(packageURL, [], false);
//       await assertRejects(
//         () => emptyHandler.LoadAllPaths("revision"),
//         Error,
//         "No entry points provided",
//       );
//     },
//   );
// });
