import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

export type DoctorStatus = "pass" | "warn" | "fail";

export interface DoctorCheck {
  id: "symlinks" | "registry" | "peers" | "legacy-peer-deps";
  status: DoctorStatus;
  message: string;
  details?: string[];
}

export interface DoctorOptions {
  cwd?: string;
  homeDir?: string;
  env?: NodeJS.ProcessEnv;
}

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  version?: string;
};

function readJson(filePath: string): PackageManifest | undefined {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as PackageManifest;
  } catch {
    return undefined;
  }
}

function npmrcValues(filePaths: string[]): Map<string, string> {
  const values = new Map<string, string>();
  for (const filePath of filePaths) {
    if (!existsSync(filePath)) continue;
    for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith(";")) continue;
      const separator = line.indexOf("=");
      if (separator === -1) continue;
      values.set(
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      );
    }
  }
  return values;
}

function danglingSymlinks(nodeModules: string): string[] {
  if (!existsSync(nodeModules)) return [];
  const candidates: string[] = [];
  for (const entry of readdirSync(nodeModules)) {
    if (entry === ".bin") continue;
    const first = path.join(nodeModules, entry);
    candidates.push(first);
    if (!entry.startsWith("@") || !existsSync(first)) continue;
    try {
      if (!lstatSync(first).isDirectory()) continue;
      for (const scopedEntry of readdirSync(first)) {
        candidates.push(path.join(first, scopedEntry));
      }
    } catch {
      // A concurrently changing node_modules tree is reported below if the
      // candidate itself is a dangling link.
    }
  }

  return candidates
    .filter((candidate) => {
      try {
        if (!lstatSync(candidate).isSymbolicLink()) return false;
        const target = readlinkSync(candidate);
        const resolved = path.resolve(path.dirname(candidate), target);
        return !existsSync(resolved);
      } catch {
        return false;
      }
    })
    .map((candidate) => path.relative(nodeModules, candidate))
    .sort();
}

function installedVersion(
  cwd: string,
  packageName: string,
): string | undefined {
  return readJson(path.join(cwd, "node_modules", packageName, "package.json"))
    ?.version;
}

function major(version: string | undefined): number | undefined {
  if (!version) return undefined;
  const match = version.match(/^(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function checkPeers(cwd: string): DoctorCheck {
  const manifest = readJson(path.join(cwd, "package.json"));
  const declared = {
    ...manifest?.devDependencies,
    ...manifest?.peerDependencies,
    ...manifest?.dependencies,
  };
  const consumesSnapshot = Boolean(declared["@lastshotlabs/snapshot"]);
  if (!consumesSnapshot) {
    return {
      id: "peers",
      status: "warn",
      message: "@lastshotlabs/snapshot is not declared in package.json.",
    };
  }

  const names = [
    "react",
    "react-dom",
    "@tanstack/react-query",
    "@tanstack/react-router",
    "jotai",
  ];
  const versions = new Map(
    names.map((name) => [name, installedVersion(cwd, name)]),
  );
  const missing = names.filter((name) => !versions.get(name));
  const details = names
    .filter((name) => versions.get(name))
    .map((name) => `${name}@${versions.get(name)}`);

  if (missing.length > 0) {
    return {
      id: "peers",
      status: "fail",
      message: `Missing required Snapshot peers: ${missing.join(", ")}.`,
      details,
    };
  }

  if (major(versions.get("react")) !== major(versions.get("react-dom"))) {
    return {
      id: "peers",
      status: "fail",
      message: "react and react-dom use different major versions.",
      details,
    };
  }

  return {
    id: "peers",
    status: "pass",
    message:
      "Required Snapshot peer packages are installed and React majors align.",
    details,
  };
}

export function runDoctor(options: DoctorOptions = {}): DoctorCheck[] {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const homeDir = options.homeDir ?? os.homedir();
  const env = options.env ?? process.env;
  const npmrc = npmrcValues([
    path.join(homeDir, ".npmrc"),
    path.join(cwd, ".npmrc"),
  ]);
  const dangling = danglingSymlinks(path.join(cwd, "node_modules"));
  const registry =
    env["npm_config_@lastshotlabs:registry"] ??
    npmrc.get("@lastshotlabs:registry");
  const isGitHubRegistry = registry?.includes("npm.pkg.github.com") ?? false;
  const hasGitHubAuth =
    Boolean(env["NODE_AUTH_TOKEN"] || env["NPM_TOKEN"]) ||
    [...npmrc.keys()].some((key) =>
      key.startsWith("//npm.pkg.github.com/:_authToken"),
    );
  const legacyPeerDeps =
    env["npm_config_legacy_peer_deps"] ?? npmrc.get("legacy-peer-deps");

  return [
    dangling.length > 0
      ? {
          id: "symlinks",
          status: "fail",
          message: `Found ${dangling.length} dangling node_modules symlink(s).`,
          details: dangling,
        }
      : {
          id: "symlinks",
          status: "pass",
          message: "No dangling node_modules symlinks found.",
        },
    isGitHubRegistry && !hasGitHubAuth
      ? {
          id: "registry",
          status: "fail",
          message:
            "@lastshotlabs points at GitHub Packages but no package-read token is configured.",
        }
      : {
          id: "registry",
          status: "pass",
          message: isGitHubRegistry
            ? "GitHub Packages scope mapping has authentication."
            : "@lastshotlabs resolves from the public npm registry.",
        },
    checkPeers(cwd),
    String(legacyPeerDeps).toLowerCase() === "true"
      ? {
          id: "legacy-peer-deps",
          status: "fail",
          message:
            "legacy-peer-deps=true is active; regenerate the lockfile with npm 11 and peer resolution enabled.",
        }
      : {
          id: "legacy-peer-deps",
          status: "pass",
          message: "legacy-peer-deps is not enabled.",
        },
  ];
}
