export async function load(ctx: {
  headers: Headers;
}): Promise<{
  data: {
    cookie: string | null;
    userAgent: string | null;
  };
}> {
  return {
    data: {
      cookie: ctx.headers.get("cookie"),
      userAgent: ctx.headers.get("user-agent"),
    },
  };
}
