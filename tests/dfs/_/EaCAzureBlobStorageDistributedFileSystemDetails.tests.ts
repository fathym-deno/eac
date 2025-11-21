import {
  EaCAzureBlobStorageDistributedFileSystemDetails,
  isEaCAzureBlobStorageDistributedFileSystemDetails,
  parseEaCAzureBlobStorageDistributedFileSystemDetails,
} from "../../../src/dfs/_/EaCAzureBlobStorageDistributedFileSystemDetails.ts";
import { assertEquals, assertThrows } from "../../test.deps.ts";

Deno.test("EaCAzureBlobStorageDistributedFileSystemDetails Tests", async (t) => {
  const validAzureBlobDFS: EaCAzureBlobStorageDistributedFileSystemDetails = {
    Type: "AzureBlobStorage",
    ConnectionString:
      "DefaultEndpointsProtocol=https;AccountName=xyz;AccountKey=abc123;",
    Container: "my-container",
    FileRoot: "/files",
    Name: "Azure Blob DFS",
    Description: "A DFS stored in Azure Blob Storage.",
  };

  const validAzureBlobMinimal: EaCAzureBlobStorageDistributedFileSystemDetails =
    {
      Type: "AzureBlobStorage",
      ConnectionString:
        "DefaultEndpointsProtocol=https;AccountName=xyz;AccountKey=abc123;",
      Container: "my-container",
    };

  const invalidAzureBlobDFSs = [
    42,
    null,
    "invalid",
    {
      Type: "RandomDFS",
      ConnectionString: "some-string",
      Container: "container",
    }, // Wrong Type
    {
      Type: "AzureBlobStorage",
      ConnectionString: 123,
      Container: "container",
    }, // ConnectionString should be a string
    {
      Type: "AzureBlobStorage",
      ConnectionString: "valid-string",
    }, // Missing required field "Container"
    {
      Type: "AzureBlobStorage",
      ConnectionString: "valid-string",
      Container: 42,
    }, // Container should be a string
  ];

  await t.step("Valid values should pass", () => {
    assertEquals(
      isEaCAzureBlobStorageDistributedFileSystemDetails(validAzureBlobDFS),
      true,
    );
    assertEquals(
      isEaCAzureBlobStorageDistributedFileSystemDetails(validAzureBlobMinimal),
      true,
    );
  });

  await t.step("Invalid values should fail", () => {
    for (const invalid of invalidAzureBlobDFSs) {
      assertEquals(
        isEaCAzureBlobStorageDistributedFileSystemDetails(invalid),
        false,
      );
    }
  });

  await t.step(
    "parseEaCAzureBlobStorageDistributedFileSystemDetails should return correct values for valid inputs",
    () => {
      assertEquals(
        parseEaCAzureBlobStorageDistributedFileSystemDetails(validAzureBlobDFS),
        validAzureBlobDFS,
      );
      assertEquals(
        parseEaCAzureBlobStorageDistributedFileSystemDetails(
          validAzureBlobMinimal,
        ),
        validAzureBlobMinimal,
      );
    },
  );

  await t.step(
    "parseEaCAzureBlobStorageDistributedFileSystemDetails should throw for invalid inputs",
    () => {
      for (const invalid of invalidAzureBlobDFSs) {
        assertThrows(() =>
          parseEaCAzureBlobStorageDistributedFileSystemDetails(invalid)
        );
      }
    },
  );
});
