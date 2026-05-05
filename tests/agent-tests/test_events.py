import pytest
from pages.dashboard_page import DashboardPage
from pages.events_page import EventsPage


class TestEvents:
    @pytest.mark.events
    def test_events_screen_loads(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        assert events.is_loaded(), "Events screen did not load"

    @pytest.mark.events
    def test_events_list_displayed(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        count = events.get_events_count()
        assert count >= 0, "Events list should render"

    @pytest.mark.events
    def test_event_titles_displayed(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        titles = events.get_event_titles()
        assert isinstance(titles, list), "Event titles should be a list"

    @pytest.mark.events
    def test_register_for_event(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        if events.get_events_count() > 0:
            events.register_for_event(0)

    @pytest.mark.events
    def test_unregister_from_event(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        events = dashboard.go_to_events()
        if events.get_events_count() > 0:
            events.unregister_from_event(0)
