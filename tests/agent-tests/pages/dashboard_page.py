from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class DashboardPage(BasePage):
    SCREEN = (AppiumBy.CSS_SELECTOR, "[data-testid='main-screen']")
    CARDS_SECTION = (AppiumBy.CSS_SELECTOR, "[data-testid='cards-section']")
    CARDS_LIST = (AppiumBy.CSS_SELECTOR, "[data-testid='cards-list']")
    CARD_ITEM = (AppiumBy.CSS_SELECTOR, "[data-testid='card-item']")

    NAV_CONTACTS = (AppiumBy.CSS_SELECTOR, "[data-testid='nav-contacts']")
    NAV_EVENTS = (AppiumBy.CSS_SELECTOR, "[data-testid='nav-events']")
    NAV_GRAPH = (AppiumBy.CSS_SELECTOR, "[data-testid='nav-graph']")
    NAV_PROFILE = (AppiumBy.CSS_SELECTOR, "[data-testid='nav-profile']")
    NAV_DASHBOARD = (AppiumBy.CSS_SELECTOR, "[data-testid='nav-dashboard']")

    ADD_CARD_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='cards-add-btn']")

    def is_loaded(self) -> bool:
        return self.is_visible(*self.SCREEN)

    def get_cards_count(self) -> int:
        items = self.find_elements(*self.CARD_ITEM)
        return len(items)

    def go_to_contacts(self):
        self.tap(*self.NAV_CONTACTS)
        from .contacts_page import ContactsPage
        return ContactsPage(self.driver, self.wait)

    def go_to_events(self):
        self.tap(*self.NAV_EVENTS)
        from .events_page import EventsPage
        return EventsPage(self.driver, self.wait)

    def go_to_profile(self):
        self.tap(*self.NAV_PROFILE)
        from .profile_page import ProfilePage
        return ProfilePage(self.driver, self.wait)

    def open_card_form(self):
        self.tap(*self.ADD_CARD_BTN)
        from .card_form_page import CardFormPage
        return CardFormPage(self.driver, self.wait)
