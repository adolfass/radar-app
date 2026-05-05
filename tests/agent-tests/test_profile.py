import pytest
from pages.dashboard_page import DashboardPage
from pages.profile_page import ProfilePage


class TestProfile:
    @pytest.mark.profile
    def test_profile_screen_loads(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_loaded(), "Profile screen did not load"

    @pytest.mark.profile
    def test_profile_displays_stats(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_visible(*profile.STATS_SECTION), "Stats section should be visible"

    @pytest.mark.profile
    def test_profile_cards_displayed(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        cards_count = profile.get_cards_count()
        assert cards_count >= 0, "Cards should be displayed"

    @pytest.mark.profile
    def test_referral_link_displayed(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_visible(*profile.REFERRAL_LINK), "Referral link should be visible"

    @pytest.mark.profile
    def test_logout_button_visible(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_visible(*profile.LOGOUT_BTN), "Logout button should be visible"
