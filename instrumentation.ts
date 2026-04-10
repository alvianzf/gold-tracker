export async function register() {
  // Only run cron on the server runtime, not in Edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initCron } = await import('@/lib/cron');
    initCron();
  }
}
