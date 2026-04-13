import { rmSync } from "node:fs";
import { generateApiReference } from "./generate-api-reference";
import { generateCapabilityMap } from "./generate-capability-map";
import { generateCliReference } from "./generate-cli-reference";
import { generateComponentReference } from "./generate-component-reference";
import { generateManifestReference } from "./generate-manifest-reference";

rmSync("apps/docs/.astro", { recursive: true, force: true });

generateApiReference();
generateCapabilityMap();
generateCliReference();
generateComponentReference();
generateManifestReference();
