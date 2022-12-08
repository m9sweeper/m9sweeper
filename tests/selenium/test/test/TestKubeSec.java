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
        driver.findElement(By.xpath("//mat-list/a[@title='KubeSec']")).click();
        // sleep to load
        Thread.sleep(2000);

        // select Choose pods from your cluster
        driver.findElement(By.xpath("//mat-radio-group/mat-radio-button[2]/label/span[1]")).click();
        // sleep to load
        Thread.sleep(1000);

        // click on Select namespace dropdown
        driver.findElement(By.xpath("//mat-select[@formcontrolname='namespaceFormControl']")).click();
        // select m9sweeper-system namespace
        driver.findElement(By.xpath("//mat-option/span[contains(text(), 'm9sweeper-system')]")).click();
        // close the modal by Esc
        actions.sendKeys(Keys.ESCAPE).perform();
        // sleep to load
        Thread.sleep(1000);

        // click on Select a pod dropdown
        driver.findElement(By.xpath("//mat-select[@formcontrolname='podFormControl']")).click();
        // Select one pod - the first m9sweeper dash pod
        driver.findElement(By.xpath("(//mat-option/span[contains(text(), 'm9sweeper-dash')])[1]")).click();
        // close the modal by Esc
        actions.sendKeys(Keys.ESCAPE).perform();
        // sleep to load
        Thread.sleep(1000);

        // click Run Kubesec button to get report
        driver.findElement(By.xpath("//button/span[normalize-space(text())='Run Kubesec']")).click();
        // sleep to load
        Thread.sleep(4000);

        // verify Advice table data existed
        String adviceTableData = driver.findElement(By.xpath("//div[1]/mat-table/mat-row[1]/mat-cell[1]")).getText();
        if (adviceTableData.length() > 0) {
            System.out.println("*** KS Advice table data exists: ***" + adviceTableData);
        }

        // verify Passed table data existed
        String passedTableData = driver.findElement(By.xpath("//div[2]/mat-table/mat-row[1]/mat-cell[1]")).getText();
        if (passedTableData.length() > 0) {
            System.out.println("*** KS Passed table data exists: ***" + passedTableData);
        }

        // click on profile and log out
        driver.findElement(By.xpath("//span[contains(@class, 'mat-menu-trigger')]/img[contains(@class, 'profile')]")).click();
        driver.findElement(By.xpath("//span[contains(normalize-space(), 'Sign Out')]")).click();

    }
}
