// Where the engine is: content/guides/local-development/configuration.mdx.

// [start:settings]
// The CLI reads the same three variables, so one `export` moves the worker,
// the starter and `orcher` to another engine together.
export const SERVER_URL = process.env.ORCHER_SERVER ?? 'http://localhost:50051';
export const NAMESPACE = process.env.ORCHER_NAMESPACE ?? 'default';
export const API_KEY = process.env.ORCHER_API_KEY || undefined; // not needed by a local engine
export const TASK_QUEUE = process.env.ORCHER_TASK_QUEUE ?? 'welcome';
// [end:settings]
