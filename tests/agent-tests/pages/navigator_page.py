from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class NavigatorPage(BasePage):
    SCREEN = (AppiumBy.CSS_SELECTOR, "[data-testid='navigator-screen']")
    WELCOME_TEXT = (AppiumBy.CSS_SELECTOR, "[data-testid='navigator-welcome']")
    CHECKLIST = (AppiumBy.CSS_SELECTOR, "[data-testid='navigator-checklist']")
    CHECKLIST_ITEM = (AppiumBy.CSS_SELECTOR, "[data-testid='navigator-checklist-item']")

    def is_loaded(self) -> bool:
        return self.is_visible(*self.SCREEN)

    def is_welcome_visible(self) -> bool:
        return self.is_visible(*self.WELCOME_TEXT)

    def get_checklist_items(self) -> list:
        items = self.find_elements(*self.CHECKLIST_ITEM)
        return [item.text for item in items]

    def check_step(self, step_id: str):
        selector = f"[data-testid='navigator-step-{step_id}']"
        self.tap(AppiumBy.CSS_SELECTOR, selector)

    def is_step_checked(self, step_id: str) -> bool:
        selector = f"[data-testid='navigator-step-{step_id}-checked']"
        return self.is_visible(AppiumBy.CSS_SELECTOR, selector)
