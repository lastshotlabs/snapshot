import { createSnapshot } from "@lastshotlabs/snapshot";

export const snapshot = createSnapshot({
  apiUrl: "",
  homePath: "/",
  auth: {
    session: { mode: "token" },
  },
});

export const { api, tokenStorage, queryClient } = snapshot;
