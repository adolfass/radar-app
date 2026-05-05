import pytest
from pages.dashboard_page import DashboardPage
from pages.profile_page import ProfilePage
from pages.contacts_page import ContactsPage
from pages.events_page import EventsPage


class TestSmoke:
    @pytest.mark.smoke
    def test_app_opens_in_telegram(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()
        assert dashboard.is_loaded(), "Main screen did not load"

    @pytest.mark.smoke
    def test_navigation_to_contacts(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        assert contacts.is_loaded(), "Contacts screen did not load"

    @pytest.mark.smoke
    def test_navigation_to_events(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        assert events.is_loaded(), "Events screen did not load"

    @pytest.mark.smoke
    def test_navigation_to_profile(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_loaded(), "Profile screen did not load"

    @pytest.mark.smoke
    def test_profile_shows_user_info(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        user_name = profile.get_user_name()
        assert user_name, "User name should be displayed"

    @pytest.mark.smoke
    def test_cards_section_visible(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_visible(*profile.CARDS_SECTION), "Cards section should be visible"

    @pytest.mark.smoke
    def test_referral_section_visible(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_visible(*profile.REFERRALS_SECTION), "Referrals section should be visible"
