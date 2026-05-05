from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from appium.webdriver.common.appiumby import AppiumBy
import time


class BasePage:
    def __init__(self, driver, wait: WebDriverWait):
        self.driver = driver
        self.wait = wait
        self.WEBVIEW_CONTEXT = None

    def switch_to_webview(self, timeout: int = 15) -> bool:
        end_time = time.time() + timeout
        while time.time() < end_time:
            try:
                contexts = self.driver.contexts
                for ctx in contexts:
                    if "WEBVIEW" in ctx:
                        self.driver.switch_to.context(ctx)
                        self.WEBVIEW_CONTEXT = ctx
                        return True
            except Exception:
                pass
            time.sleep(0.5)
        raise TimeoutError(f"WebView not found in {timeout}s")

    def switch_to_native(self):
        self.driver.switch_to.context("NATIVE_APP")
        self.WEBVIEW_CONTEXT = None

    def tap(self, by: AppiumBy, value: str, timeout: int = 10):
        element = self.wait.until(EC.element_to_be_clickable((by, value)))
        element.click()

    def input_text(self, by: AppiumBy, value: str, text: str):
        element = self.wait.until(EC.visibility_of_element_located((by, value)))
        element.clear()
        element.send_keys(text)

    def get_text(self, by: AppiumBy, value: str) -> str:
        element = self.wait.until(EC.visibility_of_element_located((by, value)))
        return element.text

    def is_visible(self, by: AppiumBy, value: str, timeout: int = 5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except Exception:
            return False

    def find_elements(self, by: AppiumBy, value: str):
        return self.driver.find_elements(by, value)

    def swipe_up(self, percent: float = 0.5, duration: int = 500):
        size = self.driver.get_window_size()
        start_x = size["width"] // 2
        start_y = int(size["height"] * (1 - percent))
        end_y = int(size["height"] * percent)
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)

    def swipe_down(self, percent: float = 0.5, duration: int = 500):
        size = self.driver.get_window_size()
        start_x = size["width"] // 2
        start_y = int(size["height"] * percent)
        end_y = int(size["height"] * (1 - percent))
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)
