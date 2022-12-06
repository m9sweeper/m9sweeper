package test;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import runner.SeleniumTestRunner;

import java.awt.*;
import java.awt.datatransfer.DataFlavor;
import java.io.BufferedReader;
import java.io.InputStreamReader;

// *** Regular maintenance is required for all locators (locators can be changed with updated code) ***

@RunWith(SeleniumTestRunner.class)
public final class TestKubeSec {

    public static String login = System.getenv().getOrDefault("LOGIN", "super.admin@intelletive.com");
    public static String password = System.getenv().getOrDefault("PASSWORD", "123456");

    @Test
    public void shouldRunKubeSecAndDisplayResults() throws Exception {
        // wait until element is visible
        EventFiringWebDriver driver = SeleniumTestRunner.driver;
        WebDriverWait myWaitVar = new WebDriverWait(driver, 4);

        driver.get(SeleniumTestRunner.baseURL + "/public/login");
        Actions actions = new Actions(driver);

        // move to auth box -> click -> find Local -> click
        actions.moveToElement(driver.findElement(By.id("authenticationmethod"))).click().sendKeys("Local").sendKeys(Keys.ENTER).click().build().perform();
        // enter credentials
        driver.findElement(By.id("email")).sendKeys(login);
        driver.findElement(By.id("password")).sendKeys(password);
        driver.findElement(By.id("submit\'")).click();

        // sleep to load page
        Thread.sleep(5000);

        // go to the default-cluster
        driver.findElement(By.xpath("//mat-card/div/span[contains(text(),'default-cluster')]")).click();

        // go to KS
        driver.findElement(By.xpath("//mat-list/a[@title='Kube Sec']")).click();
        // click on Run Audit button to open modal
        driver.findElement(By.xpath("//*[@id='Sec-audit-header-button']/button")).click();
        // sleep to load
        Thread.sleep(2000);


    }
}
