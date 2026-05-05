from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class ContactsPage(BasePage):
    SCREEN = (AppiumBy.CSS_SELECTOR, "[data-testid='contacts-screen']")
    CONTACTS_LIST = (AppiumBy.CSS_SELECTOR, "[data-testid='contacts-list']")
    CONTACT_ITEM = (AppiumBy.CSS_SELECTOR, "[data-testid='contact-item']")
    SEARCH_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='contacts-search']")
    EXPORT_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='contacts-export-btn']")
    LOOKUP_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='contact-telegram-lookup']")
    LOOKUP_INPUT = (AppiumBy.CSS_SELECTOR, "[data-testid='contact-username-lookup']")
    FIND_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='contact-add-from-telegram']")

    def is_loaded(self) -> bool:
        return self.is_visible(*self.SCREEN)

    def get_contacts_count(self) -> int:
        items = self.find_elements(*self.CONTACT_ITEM)
        return len(items)

    def search_contact(self, query: str):
        self.input_text(*self.SEARCH_INPUT, query)

    def export_vcard(self):
        self.tap(*self.EXPORT_BTN)

    def lookup_by_username(self, username: str):
        self.tap(*self.LOOKUP_BTN)
        self.input_text(*self.LOOKUP_INPUT, username)
        self.tap(*self.FIND_BTN)
