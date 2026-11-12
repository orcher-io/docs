"""TLS and mutual TLS for a worker: content/guides/sdk/python/worker.mdx."""

from orcher import Worker, WorkerConfig

import handlers  # noqa: F401


# [start:mtls]
def build_mtls_worker() -> Worker:
    return (
        Worker.builder()
        .server_url("https://orcher.internal:443")  # TLS needs an https:// URL
        .task_queue("payments")
        .tls(
            ca_cert_path="/etc/orcher/ca.pem",  # omit to use the system trust store
            client_cert_path="/etc/orcher/client.pem",  # client certificate, for mTLS
            client_key_path="/etc/orcher/client-key.pem",
        )
        .build()
    )
# [end:mtls]


# [start:client-identity]
def build_client_identity_worker() -> Worker:
    # A publicly trusted server: only the client certificate is custom.
    return (
        Worker.builder()
        .server_url("https://orcher.example.com:443")
        .task_queue("payments")
        .tls(
            client_cert_path="/etc/orcher/client.pem",
            client_key_path="/etc/orcher/client-key.pem",
        )
        .build()
    )
# [end:client-identity]


# [start:config]
def mtls_config() -> WorkerConfig:
    return WorkerConfig(
        server_url="https://orcher.internal:443",
        task_queue="payments",
        tls_ca_cert_path="/etc/orcher/ca.pem",
        tls_client_cert_path="/etc/orcher/client.pem",
        tls_client_key_path="/etc/orcher/client-key.pem",
    )
# [end:config]
