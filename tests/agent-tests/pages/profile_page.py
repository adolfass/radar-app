from appium.webdriver.common.appiumby import AppiumBy
from .base import BasePage


class ProfilePage(BasePage):
    SCREEN = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-screen']")
    USER_NAME = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-name']")
    USER_EMAIL = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-email']")
    STATS_SECTION = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-stats']")
    CARDS_SECTION = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-cards-section']")
    CARD_ITEM = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-card-item']")
    CARD_DELETE_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-card-delete']")
    REFERRALS_SECTION = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-referrals']")
    REFERRAL_LINK = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-referral-link']")
    LOGOUT_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-logout-btn']")
    SETTINGS_BTN = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-settings-btn']")
    PREMIUM_STATUS = (AppiumBy.CSS_SELECTOR, "[data-testid='profile-premium-status']")

    def is_loaded(self) -> bool:
        return self.is_visible(*self.SCREEN)

    def get_user_name(self) -> str:
        return self.get_text(*self.USER_NAME)

    def get_cards_count(self) -> int:
        items = self.find_elements(*self.CARD_ITEM)
        return len(items)

    def delete_card(self, index: int = 0):
        delete_buttons = self.find_elements(*self.CARD_DELETE_BTN)
        if delete_buttons:
            delete_buttons[index].click()

    def copy_referral_link(self):
        self.tap(*self.REFERRAL_LINK)

    def logout(self):
        self.tap(*self.LOGOUT_BTN)
