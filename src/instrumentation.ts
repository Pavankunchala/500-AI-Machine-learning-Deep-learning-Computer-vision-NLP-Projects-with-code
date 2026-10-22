export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_INGEST_SCHEDULER !== "true") return;
  const { startScheduler } = await import("./server/ingest");
  startScheduler();
}
