from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class AuthPage(BasePage):
    ONBOARDING_MODAL = (AppiumBy.CSS_SELECTOR, "[data-testid='onboarding-modal']")
    BQG_SETUP_PROMPT = (AppiumBy.CSS_SELECTOR, "[data-testid='bqg-setup-prompt']")
    BQG_GOAL_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='bqg-goal-input']")
    BQG_SAVE_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='bqg-save-btn']")
    SKIP_ONBOARDING_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='skip-onboarding']")

    def skip_onboarding(self):
        if self.is_visible(*self.ONBOARDING_MODAL):
            self.tap(*self.SKIP_ONBOARDING_BTN)

    def is_bqg_setup_visible(self) -> bool:
        return self.is_visible(*self.BQG_SETUP_PROMPT)

    def create_bqg(self, goal: str) -> object:
        self.input_text(*self.BQG_GOAL_INPUT, goal)
        self.tap(*self.BQG_SAVE_BTN)
        from .dashboard_page import DashboardPage
        return DashboardPage(self.driver, self.wait)
