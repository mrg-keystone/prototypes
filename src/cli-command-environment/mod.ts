interface Variable {
  key: string;
  latest_version: { id: bigint; value: string };
}

interface SetupResponse {
  authToken: string;
  app: { variables: Variable[] };
}

interface PullResponse {
  variables: Variable[];
}

interface Config {
  host: string;
  envName: string;
  environmentId: number;
  authToken: string;
}

const configDir = `${Deno.env.get("HOME")}/.env-vault`;

export async function setConfig(cfg: Config): Promise<void> {
  await Deno.mkdir(configDir, { recursive: true });
  const path = `${configDir}/${cfg.envName}.json`;
  await Deno.writeTextFile(path, JSON.stringify(cfg, null, 2));
}

export async function getConfig(envName: string): Promise<Config> {
  const path = `${configDir}/${envName}.json`;
  const text = await Deno.readTextFile(path);
  return JSON.parse(text);
}

export async function deleteConfig(envName: string): Promise<void> {
  const path = `${configDir}/${envName}.json`;
  await Deno.remove(path);
}

export async function setup(
  host: string,
  envId: number,
  authToken: string,
): Promise<SetupResponse> {
  const url = `https://${host}/api/v1/apps/${envId}/setup/${authToken}`;
  console.log(url);
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error("Invalid setup token");
  return res.json();
}

export async function pull(
  host: string,
  envId: number,
  authToken: string,
): Promise<PullResponse> {
  const url = `https://${host}/api/v1/apps/${envId}/update`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error("Configuration error");
  return res.json();
}
