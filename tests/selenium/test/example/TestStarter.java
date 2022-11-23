package example;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import runner.SeleniumTestRunner;

/**
 * This is a starter test to demonstrate how to do a selenium test
 */
@RunWith(SeleniumTestRunner.class)
public final class TestStarter {

  @Test
  public void emptyTestThatDoesNothing() throws Exception {
    // wait until element is visible
    EventFiringWebDriver driver = SeleniumTestRunner.driver;

    // get first page
    driver.get(SeleniumTestRunner.baseURL + "/");
    Actions action = new Actions(driver);

    // YOUR TEST HERE
  }

}
