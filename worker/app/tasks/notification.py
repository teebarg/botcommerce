from core.notifications import Channel, PushEvent
from core.notifications.base import PushSubscription
from core.notifications.channels.push import PushSubscriptionExpired


async def process_push_notification(ctx, payload: dict, subscription_ids: list[str]):
    notification_srv = ctx["notification_srv"]
    pool = ctx["db_pool"]
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, endpoint, p256dh, auth
            FROM push_subscriptions
            WHERE id = ANY($1::text[])
            """,
            subscription_ids,
        )

        results = await notification_srv.send(
            PushEvent(
                subscriptions=[
                    PushSubscription(
                        endpoint=row["endpoint"], p256dh=row["p256dh"], auth=row["auth"]
                    )
                    for row in rows
                ],
                title=payload["title"],
                body=payload["body"],
            ),
            channels=[Channel.PUSH],
        )
        for result in results:
            if result is not None:
               print([(type(r).__name__, type(r).__module__) for r in results if r is not None])

        expired_ids = [
            row["id"]
            for row, result in zip(rows, results)
            if isinstance(result, PushSubscriptionExpired)
        ]
        print("🚀 ~ process_push_notification ~ expired_ids:", expired_ids)

        # if expired_ids:
        #     await conn.execute(
        #         "DELETE FROM push_subscriptions WHERE id = ANY($1::text[])",
        #         expired_ids,
        #     )
