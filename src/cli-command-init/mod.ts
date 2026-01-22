// =============================================================================
// DTOs
// =============================================================================

interface CloneRequest {
  repoUrl: string;
  repoName: string;
  targetDir: string;
}

interface CloneResult {
  repoName: string;
  success: boolean;
}

// =============================================================================
// Data Layer
// =============================================================================

class RepoConfig {
  static readonly repos = [
    "https://github.com/mrg-keystone/backend",
    "https://github.com/mrg-keystone/ui",
    "https://github.com/mrg-keystone/prototypes",
    "https://github.com/mrg-keystone/cli",
    "https://github.com/mrg-keystone/docs",
  ];
}

class GitClient {
  async clone(request: CloneRequest): Promise<CloneResult> {
    const command = new Deno.Command("git", {
      args: ["clone", request.repoUrl],
      cwd: request.targetDir,
      stdout: "inherit",
      stderr: "inherit",
    });

    const { code } = await command.output();
    return { repoName: request.repoName, success: code === 0 };
  }
}

class FileSystem {
  async createDirectory(path: string): Promise<void> {
    await Deno.mkdir(path, { recursive: true });
  }
}

// =============================================================================
// Business Layer (pure, no external dependencies)
// =============================================================================

class CloneRequestBuilder {
  static extractRepoName(url: string): string {
    return url.split("/").pop()!;
  }

  static buildTargetDir(basePath: string): string {
    return `${basePath}/keystone-suite`;
  }

  static build(repos: string[], targetDir: string): CloneRequest[] {
    return repos.map((repoUrl) => ({
      repoUrl,
      repoName: this.extractRepoName(repoUrl),
      targetDir,
    }));
  }
}

class CloneLogger {
  static logStart(repoName: string): void {
    console.log(`Cloning ${repoName}...`);
  }

  static logResult(result: CloneResult): void {
    if (!result.success) {
      console.error(`Failed to clone ${result.repoName}`);
    }
  }

  static logComplete(): void {
    console.log("Done cloning all repos.");
  }
}

// =============================================================================
// Coordinator (sandwich pattern)
// =============================================================================

class InitCoordinator {
  constructor(
    private gitClient: GitClient,
    private fileSystem: FileSystem,
  ) {}

  async cloneAll(basePath: string): Promise<void> {
    const targetDir = CloneRequestBuilder.buildTargetDir(basePath);
    await this.fileSystem.createDirectory(targetDir);

    const requests = CloneRequestBuilder.build(RepoConfig.repos, targetDir);

    for (const request of requests) {
      CloneLogger.logStart(request.repoName);
      const result = await this.gitClient.clone(request);
      CloneLogger.logResult(result);
    }

    CloneLogger.logComplete();
  }
}

// =============================================================================
// Exports
// =============================================================================

export const repos = RepoConfig.repos;

export async function cloneRepos(path: string): Promise<void> {
  const coordinator = new InitCoordinator(new GitClient(), new FileSystem());
  return coordinator.cloneAll(path);
}
