from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class EventsPage(BasePage):
    SCREEN = (AppiumBy.CSS_SELECTOR, "[data-testid='events-screen']")
    EVENTS_LIST = (AppiumBy.CSS_SELECTOR, "[data-testid='events-list']")
    EVENT_ITEM = (AppiumBy.CSS_SELECTOR, "[data-testid='event-item']")
    EVENT_TITLE = (AppiumBy.CSS_SELECTOR, "[data-testid='event-title']")
    REGISTER_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='events-register-btn']")
    UNREGISTER_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='events-unregister-btn']")

    def is_loaded(self) -> bool:
        return self.is_visible(*self.SCREEN)

    def get_events_count(self) -> int:
        items = self.find_elements(*self.EVENT_ITEM)
        return len(items)

    def get_event_titles(self) -> list:
        titles = self.find_elements(*self.EVENT_TITLE)
        return [t.text for t in titles]

    def register_for_event(self, index: int = 0):
        event_items = self.find_elements(*self.EVENT_ITEM)
        if event_items:
            event_items[index].click()
        self.tap(*self.REGISTER_BTN)

    def unregister_from_event(self, index: int = 0):
        event_items = self.find_elements(*self.EVENT_ITEM)
        if event_items:
            event_items[index].click()
        self.tap(*self.UNREGISTER_BTN)
