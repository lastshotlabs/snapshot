import { safeJsonStringify } from "@lastshotlabs/snapshot/ssr";

export function hydrationScript(data: unknown): string {
  return `<script>window.__SNAPSHOT_DATA__=${safeJsonStringify(data)}</script>`;
}
