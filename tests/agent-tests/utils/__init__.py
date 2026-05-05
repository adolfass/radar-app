import subprocess
import time
from typing import Optional


class TelegramHelper:
    @staticmethod
    def open_mini_app(bot_username: str, start_param: Optional[str] = None):
        url = f"https://t.me/{bot_username}"
        if start_param:
            url += f"?start={start_param}"

        subprocess.run([
            "adb", "shell", "am", "start",
            "-a", "android.intent.action.VIEW",
            "-d", url,
            "-n", "org.telegram.messenger/.ExternalUriResolverActivity"
        ], check=True)
        time.sleep(3)

    @staticmethod
    def force_close_telegram():
        subprocess.run(["adb", "shell", "am", "force-stop", "org.telegram.messenger"], check=True)

    @staticmethod
    def clear_telegram_cache():
        subprocess.run([
            "adb", "shell", "pm", "clear", "org.telegram.messenger.web"
        ], check=True)
