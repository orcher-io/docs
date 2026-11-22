"""Payload encryption: content/guides/security/payload-encryption.mdx."""

# [start:basic]
import base64
import os

from orcher import Client, ClientConfig, Encryption, Worker

# 32 random bytes from your secret store, here base64 in an environment variable.
key = base64.b64decode(os.environ["ORCHER_PAYLOAD_KEY"])

client = Client(
    ClientConfig(
        server_url="http://localhost:50051",
        namespace="default",
        encryption=Encryption(key=key),
    )
)

worker = (
    Worker.builder()
    .server_url("http://localhost:50051")
    .namespace("default")
    .task_queue("orders")
    .encryption(Encryption(key=key))
    .build()
)
# [end:basic]


def rotated(current: bytes, previous: bytes) -> Worker:
    # [start:rotation]
    # Writes with the 2026 key and still reads what the 2025 key wrote.
    encryption = Encryption(
        key=current,
        key_id="2026",
        decryption_keys={"2025": previous},
    )
    worker = (
        Worker.builder()
        .server_url("http://localhost:50051")
        .task_queue("orders")
        .encryption(encryption)
        .build()
    )
    # [end:rotation]
    return worker


def compressed(current: bytes) -> Client:
    # [start:compression]
    # Compressed first, then encrypted.
    client = Client(
        ClientConfig(
            server_url="http://localhost:50051",
            compression="gzip",
            encryption=Encryption(key=current, key_id="2026"),
        )
    )
    # [end:compression]
    return client
