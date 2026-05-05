import pytest
from pages.dashboard_page import DashboardPage
from pages.navigator_page import NavigatorPage


class TestNavigation:
    @pytest.mark.navigation
    def test_tab_switching_full_cycle(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        assert contacts.is_loaded()

        dashboard2 = DashboardPage(driver, wait)
        events = dashboard2.go_to_events()
        assert events.is_loaded()

        dashboard3 = DashboardPage(driver, wait)
        profile = dashboard3.go_to_profile()
        assert profile.is_loaded()

    @pytest.mark.navigation
    def test_back_to_dashboard_from_contacts(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        assert contacts.is_loaded()

        dashboard.tap(*dashboard.NAV_DASHBOARD)
        assert dashboard.is_loaded()

    @pytest.mark.navigation
    def test_back_to_dashboard_from_events(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        assert events.is_loaded()

        dashboard.tap(*dashboard.NAV_DASHBOARD)
        assert dashboard.is_loaded()

    @pytest.mark.navigation
    def test_back_to_dashboard_from_profile(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        profile = dashboard.go_to_profile()
        assert profile.is_loaded()

        dashboard.tap(*dashboard.NAV_DASHBOARD)
        assert dashboard.is_loaded()
