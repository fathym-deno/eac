// import { EverythingAsCode } from "../../src/eac/EverythingAsCode.ts";
// import { $FluentTagDeepStrip } from "../../src/fluent/.deps.ts";
// import { eacFluentBuilder } from "../../src/fluent/eacFluentBuilder.ts";
// import { EaCDenoKVDatabaseDetails } from "../../src/modules/databases/EaCDenoKVDatabaseDetails.ts";
// import { EverythingAsCodeDatabases } from "../../src/modules/databases/EverythingAsCodeDatabases.ts";
// import { assert, assertEquals } from "../test.deps.ts";

// // Test for the `eacFluentBuilder` function
// Deno.test("Testing eacFluentBuilder functionality", async (t) => {
//   type TaggedEaC =
//     // EverythingAsCodeTags<
//     EverythingAsCode & EverythingAsCodeDatabases;
//   // >;
//   type stripped = $FluentTagDeepStrip<TaggedEaC, "Methods">;

//   await t.step("EnterpriseLookup method test", () => {
//     const bldr = eacFluentBuilder<TaggedEaC>().Root();

//     // Call the EnterpriseLookup method
//     const enterpriseId: string = crypto.randomUUID();
//     bldr.EnterpriseLookup(enterpriseId);

//     // Verify the exported state
//     const exported = bldr.Export();
//     assert(exported);
//     assertEquals(exported.EnterpriseLookup, enterpriseId);
//   });

//   await t.step("Details method and Name setting test", () => {
//     const bldr = eacFluentBuilder<TaggedEaC>().Root();

//     // Set the name in Details
//     bldr.Details().Name("My Name");

//     // Verify the exported state
//     const exported = bldr.Export();
//     assert(exported);
//     assertEquals(exported.Details!.Name, "My Name");
//   });

//   await t.step("Handlers method test", () => {
//     const bldr = eacFluentBuilder<TaggedEaC>().Root();

//     // Call the Handlers method and set values
//     bldr.Handlers.$Force(true);
//     const handlers = bldr.Handlers("asdfa", true);

//     handlers.APIPath("https://api.com").Order(100);

//     // Verify the exported state
//     const exported = bldr.Export();
//     assert(exported);
//     assertEquals(exported.Handlers!["asdfa"].APIPath, "https://api.com");
//     assertEquals(exported.Handlers!["asdfa"].Order, 100);
//     assertEquals(exported.Handlers!.$Force, true);
//   });

//   await t.step("Database Details method test", () => {
//     const bldr = eacFluentBuilder<TaggedEaC>().Root();

//     // Set values in Databases Details
//     const db = bldr.Databases("thinky", true);

//     const databaseDetails = db
//       .Details<EaCDenoKVDatabaseDetails>()
//       .Type("DenoKV")
//       .DenoKVPath("ThePath");

//     // Verify the exported state
//     const exported = bldr.Export();
//     assert(exported);
//     assert(exported.Databases);
//     assert(databaseDetails);
//     assertEquals(exported.Databases!["thinky"].Details!.Type, "DenoKV");
//     assertEquals(
//       (exported.Databases!["thinky"].Details as EaCDenoKVDatabaseDetails)
//         .DenoKVPath,
//       "ThePath",
//     );
//   });

//   await t.step("Compile test", () => {
//     const bldr = eacFluentBuilder<TaggedEaC>().Root();

//     // Call the Compile method
//     // bldr.Compile();

//     // Export the state
//     const eac = bldr.Export();

//     // Verify the exported state
//     assert(eac);
//     // assert(eac.Compile);
//   });

//   await t.step("Compile and Export method test", () => {
//     const bldr = eacFluentBuilder<TaggedEaC>().Root();

//     bldr.EnterpriseLookup(crypto.randomUUID());

//     bldr.Details().Name("My Name");

//     bldr.Handlers.$Force(true);
//     const handlers = bldr.Handlers("asdfa", true);

//     handlers.APIPath("https://api.com").Order(100);

//     bldr.Databases("thinky", true).Details().Type("Hey");

//     // bldr.Compile();

//     const eac = bldr.Export();

//     assert(eac);
//     assertEquals(eac.Details!.Name, "My Name");
//     assert(eac.Handlers!.$Force);
//     assertEquals(eac.Databases!["thinky"]!.Details!.Type, "Hey");
//   });
// });
