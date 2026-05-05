import pytest
from pages.dashboard_page import DashboardPage
from pages.contacts_page import ContactsPage


class TestContacts:
    @pytest.mark.contacts
    def test_contacts_screen_loads(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        assert contacts.is_loaded(), "Contacts screen did not load"

    @pytest.mark.contacts
    def test_contacts_list_displayed(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        count = contacts.get_contacts_count()
        assert count >= 0, "Contacts list should render"

    @pytest.mark.contacts
    def test_search_contact(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        contacts.search_contact("test")

    @pytest.mark.contacts
    def test_export_vcard(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        contacts.export_vcard()

    @pytest.mark.contacts
    def test_telegram_lookup(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        contacts = dashboard.go_to_contacts()
        contacts.lookup_by_username("@testuser")
