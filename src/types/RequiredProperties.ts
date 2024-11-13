// import { RemoveIndexSignatures } from "jsr:@fathym/common@0.2.162";
// import { EaCDistributedFileSystemDetails } from "../modules/dfs/EaCDistributedFileSystemDetails.ts";
// import { IsRequiredProperty } from "./IsRequiredProperty.ts";
// import { EaCDistributedFileSystemAsCode } from "../modules/dfs/EaCDistributedFileSystemAsCode.ts";
// import { EverythingAsCodeDFS } from "../modules/dfs/EverythingAsCodeDFS.ts";
// import { EverythingAsCode } from "../azure/.deps.ts";
// import { EverythingAsCodeApplications } from "../modules/applications/EverythingAsCodeApplications.ts";

// export type RequiredProperties<T> = {
//   [
//     K in keyof RemoveIndexSignatures<T> as IsRequiredProperty<
//       RemoveIndexSignatures<T>,
//       K
//     > extends true ? K
//       : never
//   ]: NonNullable<RemoveIndexSignatures<T>[K]>;
// };

// type t = RequiredProperties<
//   RemoveIndexSignatures<EaCDistributedFileSystemDetails>
// >;
// type tt = RequiredProperties<
//   RemoveIndexSignatures<EaCDistributedFileSystemAsCode>
// >;
// type ttt = RequiredProperties<
//   RemoveIndexSignatures<EverythingAsCodeApplications>
// >;
