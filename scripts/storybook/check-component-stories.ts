import { collectComponentDirectories } from "../docs/component-inventory.ts";

const componentDirectories = collectComponentDirectories();
const failures: string[] = [];

for (const component of componentDirectories) {
  if (!component.hasComponent) {
    failures.push(`Missing standalone component entry for "${component.relativeDir}".`);
  }
}

if (failures.length > 0) {
  console.error(`[storybook:coverage] ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `[storybook:coverage] Verified ${componentDirectories.length} component directories.`,
);
