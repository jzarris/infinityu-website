"""Daily retention sweep for the site, run as a Modal scheduled function.

Calls POST {SITE_URL}/api/cron/retention with the shared secret so expired
photos and outputs are deleted on schedule regardless of traffic. Also runs the
site's audit-log and trusted-browser cleanups.

Setup:
    modal secret create bodysim-cron CRON_SECRET=<same value as Railway CRON_SECRET> SITE_URL=https://www.meltawaymd.com
    modal deploy modal_cron.py
"""

import modal

app = modal.App("bodysim-cron")
image = modal.Image.debian_slim(python_version="3.11").pip_install("requests")


@app.function(
    image=image,
    schedule=modal.Cron("15 9 * * *"),  # daily at 09:15 UTC (02:15 Pacific)
    secrets=[modal.Secret.from_name("bodysim-cron")],
    timeout=300,
)
def retention_sweep():
    import os

    import requests

    url = os.environ["SITE_URL"].rstrip("/") + "/api/cron/retention"
    r = requests.post(url, headers={"x-cron-secret": os.environ["CRON_SECRET"]}, timeout=120)
    print("retention sweep:", r.status_code, r.text[:300])
    r.raise_for_status()
    return r.json()
