import pytest
from pages.dashboard_page import DashboardPage
from pages.card_form_page import CardFormPage


class TestBusinessCard:
    @pytest.mark.business_card
    def test_open_card_form(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        form = dashboard.open_card_form()
        assert form.is_loaded(), "Card form did not open"

    @pytest.mark.business_card
    def test_fill_and_submit_card_form(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        form = dashboard.open_card_form()
        form.fill_form(
            name="Test Agent",
            email="test@agent.dev",
            phone="+79991234567",
            title="QA Engineer",
            company="Test Corp"
        )
        form.submit()

    @pytest.mark.business_card
    def test_card_form_validation(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        form = dashboard.open_card_form()
        form.submit()

    @pytest.mark.business_card
    def test_cancel_card_form(self, driver, wait):
        dashboard = DashboardPage(driver, wait)
        dashboard.switch_to_webview()

        form = dashboard.open_card_form()
        form.cancel()
