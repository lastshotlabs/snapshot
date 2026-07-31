import { createSnapshot } from "@lastshotlabs/snapshot";

const snapshot = createSnapshot({ apiUrl: "https://api.example.com" });

export function AuthExample() {
  const { user, isLoading } = snapshot.useUser();
  if (isLoading) return <p>Loading your session…</p>;
  return <p>{user ? `Signed in as ${user.email}` : "Signed out"}</p>;
}
