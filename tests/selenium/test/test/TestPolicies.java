package test;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import runner.SeleniumTestRunner;

// *** Regular maintenance is required for all locators (locators can be changed with updated code) ***

@RunWith(SeleniumTestRunner.class)
public final class TestPolicies {
	// add credentials
	public static String login = System.getenv().getOrDefault("LOGIN", "super.admin@intelletive.com");
	public static String password = System.getenv().getOrDefault("PASSWORD", "123456");

  @Test
  public void ShouldAddNewPolicy() throws Exception {
    // wait until element is visible
    EventFiringWebDriver driver = SeleniumTestRunner.driver;

    // get first page
    driver.get(SeleniumTestRunner.baseURL + "/public/login");
    Actions action = new Actions(driver);

    // move to auth box -> click -> find Local -> click
    action.moveToElement(driver.findElement(By.id("authenticationmethod"))).click().sendKeys("Local").sendKeys(Keys.ENTER).click().build().perform();
    // enter credentials
    driver.findElement(By.id("email")).sendKeys(login);
    driver.findElement(By.id("password")).sendKeys(password);
    driver.findElement(By.id("submit\'")).click();

    // sleep to load page
    Thread.sleep(5000);

    // select organization setting
    driver.findElement(By.cssSelector(".organization-settings-text")).click();
    // select Policies
    driver.findElement(By.xpath("//span[contains(@class, 'mat-list-text')]/span[contains(text(),'Policies')]")).click();
    // click New Policy
    driver.findElement(By.xpath("//button/span[contains(text(),'New Policy')]")).click();
    // add new name
    driver.findElement(By.xpath("//input[@formcontrolname='name']")).click();
    driver.findElement(By.xpath("//input[@formcontrolname='name']")).sendKeys("test name");
    // add description
    driver.findElement(By.xpath("//textarea[@formcontrolname='description']")).click();
    driver.findElement(By.xpath("//textarea[@formcontrolname='description']")).sendKeys("test desc");
    // click on Clusters dropdown
    driver.findElement(By.xpath("//mat-select[@formcontrolname='clusters']")).click();
    // select for all clusters
    driver.findElement(By.xpath("//mat-option/span[contains(normalize-space(), 'For All Clusters')]")).click();
    // click away of the cluster modal
    action.sendKeys(Keys.ESCAPE).build().perform();
    // submit
    driver.findElement(By.xpath("//button[@type ='submit']")).click();

    // sleep to load page
    Thread.sleep(2000);

    // click on profile and log out
    driver.findElement(By.xpath("//span[contains(@class, 'mat-menu-trigger')]/img[contains(@class, 'profile')]")).click();
    driver.findElement(By.xpath("//span[contains(normalize-space(), 'Sign Out')]")).click();

  }

}
