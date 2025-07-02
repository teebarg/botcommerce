from huey_instance import huey

@huey.task()
def sync_disconnected_sessions():
    print("[✓] Running background sync...")
    try:
        print("Disconnected sessions:")
    except Exception as e:
        print("Sync error:", e)
