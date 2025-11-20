import { EaCRemoteDistributedFileSystemDetails, isEaCRemoteDistributedFileSystemDetails, parseEaCRemoteDistributedFileSystemDetails } from "../../../src/dfs/_/EaCRemoteDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCRemoteDistributedFileSystemDetails Tests", async (t) => {
  const validRemoteDFS: EaCRemoteDistributedFileSystemDetails = {
    Type: "Remote",
    RemoteRoot: "https://cdn.example.com/files",
    Name: "Remote DFS",
    Description: "A DFS that points to a remote file system.",
  };

  const validMinimalRemoteDFS: EaCRemoteDistributedFileSystemDetails = {
    Type: "Remote",
    RemoteRoot: "https://storage.example.com/",
  };

  const invalidRemoteDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      RemoteRoot: "https://cdn.example.com/files",
    }, // Wrong Type
    {
      Type: "Remote",
    }, // Missing RemoteRoot
    {
      RemoteRoot: "https://cdn.example.com/files",
    }, // Missing Type
    {
      Type: "Remote",
      RemoteRoot: 123,
    }, // RemoteRoot should be a string
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(isEaCRemoteDistributedFileSystemDetails(validRemoteDFS), true);
    assertEquals(
      isEaCRemoteDistributedFileSystemDetails(validMinimalRemoteDFS),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidRemoteDFSs) {
      assertEquals(isEaCRemoteDistributedFileSystemDetails(invalid), false);
    }
  });

  await t.step(
    "parseEaCRemoteDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCRemoteDistributedFileSystemDetails(validRemoteDFS),
        validRemoteDFS,
      );
      assertEquals(
        parseEaCRemoteDistributedFileSystemDetails(validMinimalRemoteDFS),
        validMinimalRemoteDFS,
      );
    },
  );

  await t.step(
    "parseEaCRemoteDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidRemoteDFSs) {
        assertThrows(() => parseEaCRemoteDistributedFileSystemDetails(invalid));
      }
    },
  );
});
