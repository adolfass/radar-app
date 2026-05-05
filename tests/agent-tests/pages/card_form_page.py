from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class CardFormPage(BasePage):
    SCREEN = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form']")
    NAME_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-name']")
    EMAIL_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-email']")
    PHONE_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-phone']")
    TITLE_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-title']")
    COMPANY_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-company']")
    SUBMIT_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-submit']")
    CANCEL_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='card-form-cancel']")

    def is_loaded(self) -> bool:
        return self.is_visible(*self.SCREEN)

    def fill_form(self, name: str, email: str, phone: str = "", title: str = "", company: str = ""):
        self.input_text(*self.NAME_INPUT, name)
        self.input_text(*self.EMAIL_INPUT, email)
        if phone:
            self.input_text(*self.PHONE_INPUT, phone)
        if title:
            self.input_text(*self.TITLE_INPUT, title)
        if company:
            self.input_text(*self.COMPANY_INPUT, company)

    def submit(self):
        self.tap(*self.SUBMIT_BTN)

    def cancel(self):
        self.tap(*self.CANCEL_BTN)
