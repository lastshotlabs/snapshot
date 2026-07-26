export async function load(): Promise<{ notFound: true }> {
  return { notFound: true };
}

export async function meta(): Promise<Record<string, unknown>> {
  throw new Error("meta blew up");
}
