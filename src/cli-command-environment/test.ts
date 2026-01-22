import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { setup, pull, setConfig, getConfig, deleteConfig } from "./mod.ts";

const server = "envault-deploy.ngrok.app";
const appId = 5;
// when testing you have to log into env-vault look at the test environment
// and then get the setup token from there, its swapped every 10 mins if you
// dont this test will fail
const setupToken = "GVA24cfiuUMZJ7AV";

let authToken: string;

Deno.test("setup - returns auth token and variables", async () => {
  const result = await setup(server, appId, setupToken);

  assertEquals(typeof result.authToken, "string");
  assertEquals(Array.isArray(result.app.variables), true);

  authToken = result.authToken;
  console.log("Got auth token:", authToken);
  console.log(
    "Variables:",
    result.app.variables.map((v) => v.key),
  );
});

Deno.test("pull - setup then pull", async () => {
  const setupResult = await setup(server, appId, setupToken);

  const config = {
    host: server,
    envName: "pull-test",
    environmentId: appId,
    authToken: setupResult.authToken,
  };

  const result = await pull(
    config.host,
    config.environmentId,
    config.authToken,
  );

  assertEquals(Array.isArray(result.variables), true);
  console.log(
    "Pulled variables:",
    result.variables.map((v) => v.key),
  );
});

Deno.test("config - set, get, delete", async () => {
  const testConfig = {
    host: "test.example.com",
    envName: "test-env",
    environmentId: 99,
    authToken: "test-token-abc",
  };

  await setConfig(testConfig);

  const retrieved = await getConfig("test-env");
  assertEquals(retrieved.host, testConfig.host);
  assertEquals(retrieved.envName, testConfig.envName);
  assertEquals(retrieved.environmentId, testConfig.environmentId);
  assertEquals(retrieved.authToken, testConfig.authToken);

  await deleteConfig("test-env");

  await assertRejects(() => getConfig("test-env"), Deno.errors.NotFound);
});
