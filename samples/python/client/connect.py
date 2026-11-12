"""Connecting a client: content/guides/sdk/python/client.mdx."""

import asyncio
import os
from datetime import timedelta

from orcher import Client, ClientConfig


async def main() -> None:
    # [start:connect]
    config = ClientConfig(
        server_url="http://localhost:50051",
        namespace="default",
        # api_key defaults to the ORCHER_API_KEY environment variable.
        request_timeout=timedelta(seconds=30),
    )

    async with Client(config) as client:
        handle = await client.start_workflow("order", task_queue="orders", args=("order-1",))
        print(handle.workflow_id)
    # [end:connect]

    # [start:manual]
    client = Client(config)
    await client.connect()
    try:
        handle = await client.get_workflow("order-1")
    finally:
        await client.close()
    # [end:manual]


def tls_config() -> ClientConfig:
    # [start:tls]
    return ClientConfig(
        server_url="https://orcher.example.com:443",
        tls_ca_cert_path="/etc/orcher/ca.pem",  # omit to use the system trust store
        tls_client_cert_path="/etc/orcher/client.pem",  # client certificate, for mTLS
        tls_client_key_path="/etc/orcher/client-key.pem",
    )
    # [end:tls]


# [start:api-key]
def explicit_key_config() -> ClientConfig:
    # A key from somewhere other than ORCHER_API_KEY.
    return ClientConfig(
        server_url="https://orcher.example.com:443",
        api_key=os.environ["PAYMENTS_ORCHER_KEY"],
    )


def no_key_config() -> ClientConfig:
    # No key, even when ORCHER_API_KEY is set.
    return ClientConfig(server_url="http://localhost:50051", api_key=None)
# [end:api-key]


if __name__ == "__main__":
    asyncio.run(main())
