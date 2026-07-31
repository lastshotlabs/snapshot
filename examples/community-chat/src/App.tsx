import { createSnapshot } from "@lastshotlabs/snapshot";

const snapshot = createSnapshot({ apiUrl: "https://api.example.com" });

export function CommunityChatExample({ containerId }: { containerId: string }) {
  const { data, isLoading } = snapshot.useContainerThreads({ containerId });
  if (isLoading) return <p>Loading conversations…</p>;
  return (
    <ul>
      {data?.items.map((thread) => (
        <li key={thread.id}>{thread.title}</li>
      ))}
    </ul>
  );
}
