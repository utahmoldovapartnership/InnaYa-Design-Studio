import { getContentReaderKey } from "@/lib/keystatic-reader-key";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const { key } = await context.params;
  const readerKey = await getContentReaderKey();

  if (key !== readerKey) {
    return new Response(readerKey, { status: 200 });
  }

  const { waitForContentChange } = await import("./dev-watcher");
  const nextKey = await waitForContentChange(key);
  return new Response(nextKey, { status: 200 });
}
