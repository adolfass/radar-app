import os
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.appium_service import AppiumService
from selenium.webdriver.support.ui import WebDriverWait
from datetime import datetime


@pytest.fixture(scope="session")
def appium_service():
    service = AppiumService()
    service.start(args=["--relaxed-security", "--log-timestamp", "--local-timezone"])
    yield service
    service.stop()


@pytest.fixture(scope="session")
def driver(appium_service):
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Android"
    options.app_package = "org.telegram.messenger"
    options.app_activity = "org.telegram.ui.LaunchActivity"
    options.no_reset = True
    options.new_command_timeout = 180
    options.auto_grant_permissions = True

    driver = webdriver.Remote("http://localhost:4723", options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 15, poll_frequency=0.5)


@pytest.fixture
def telegram_bot_username():
    return os.environ.get("RADAR_BOT_USERNAME", "radar_strateg_bot")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()

    if rep.when == "call" and rep.failed:
        driver = item.funcargs.get("driver")
        if driver:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"reports/screenshots/{item.name}_{timestamp}.png"
            os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
            driver.save_screenshot(screenshot_path)
            rep.sections.append(("Screenshot", screenshot_path))
