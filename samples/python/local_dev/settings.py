"""Where the engine is: content/guides/local-development/configuration.mdx."""

# [start:settings]
import os

# The CLI reads the same three variables, so one `export` moves the worker,
# the starter and `orcher` to another engine together.
SERVER_URL = os.environ.get("ORCHER_SERVER", "http://localhost:50051")
NAMESPACE = os.environ.get("ORCHER_NAMESPACE", "default")
API_KEY = os.environ.get("ORCHER_API_KEY") or None  # not needed by a local engine
TASK_QUEUE = os.environ.get("ORCHER_TASK_QUEUE", "welcome")
# [end:settings]
