// A route whose loader signals notFound AND whose meta() handles that envelope.
// Apps write meta() exactly like this — one function covering both the happy
// result and the signal — so the renderer must call it on the signal path too.
export async function load(): Promise<{ notFound: true }> {
  return { notFound: true };
}

export async function meta(
  _ctx: unknown,
  result: unknown,
): Promise<Record<string, unknown>> {
  if (result && typeof result === "object" && "notFound" in result) {
    return { title: "Profile not found", robots: "noindex, follow" };
  }
  return { title: "A profile" };
}
