// Fixture: a load() returning non-JSON values (Date instances), as happens
// when a loader reads entities directly from a storage adapter. The renderer
// must JSON-normalize these before render so SSR output matches what the
// client hydrates with.
export async function load() {
  return {
    data: {
      title: "date fixture",
      createdAt: new Date("2026-05-08T19:53:13.916Z"),
    },
    queryCache: [
      {
        queryKey: ["fixture", "entry"],
        data: { updatedAt: new Date("2026-01-02T03:04:05.678Z") },
      },
    ],
  };
}
