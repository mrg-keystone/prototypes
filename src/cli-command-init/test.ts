import { assertEquals } from "jsr:@std/assert";
import { exists } from "jsr:@std/fs";
import { cloneRepos } from "./mod.ts";

Deno.test("creates keystone-suite and clones all repos", async () => {
  const testDir = await Deno.makeTempDir();

  try {
    await cloneRepos(testDir);

    const suiteDir = `${testDir}/keystone-suite`;
    assertEquals(
      await exists(suiteDir),
      true,
      "keystone-suite directory should exist",
    );

    assertEquals(await exists(`${suiteDir}/backend`), true);
    assertEquals(await exists(`${suiteDir}/backend/.git`), true);

    assertEquals(await exists(`${suiteDir}/ui`), true);
    assertEquals(await exists(`${suiteDir}/ui/.git`), true);

    assertEquals(await exists(`${suiteDir}/prototypes`), true);
    assertEquals(await exists(`${suiteDir}/prototypes/.git`), true);

    assertEquals(await exists(`${suiteDir}/cli`), true);
    assertEquals(await exists(`${suiteDir}/cli/.git`), true);

    assertEquals(await exists(`${suiteDir}/docs`), true);
    assertEquals(await exists(`${suiteDir}/docs/.git`), true);
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});
