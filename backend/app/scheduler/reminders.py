from apscheduler.schedulers.background import BackgroundScheduler

scheduler = None


def start_scheduler() -> None:
    global scheduler
    if scheduler is not None:
        return
    scheduler = BackgroundScheduler()
    scheduler.add_job(lambda: print("Reminder check triggered"), "interval", minutes=30)
    scheduler.start()
