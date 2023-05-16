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
import java.time.Year;

// *** Regular maintenance is required for all locators (locators can be changed with updated code) ***

@RunWith(SeleniumTestRunner.class)
public final class TestKubeHunter {

    public static String login = System.getenv().getOrDefault("LOGIN", "super.admin@intelletive.com");
    public static String password = System.getenv().getOrDefault("PASSWORD", "123456");

    @Test
    public void shouldRunKubeHunterAndDisplayResults() throws Exception {
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

        // note : click on the UI, run audit, select Run One Time, copy helm command, pass it to bash in the test, check if there's data displayed
        // setup minikube/ m9 (port forward), start selenium test with localhost 5000 (local test- change localhost!!)

        // go to KH
        driver.findElement(By.xpath("//mat-list/a[@title='Kube Hunter']")).click();
        // click on Run Audit button to open modal
        driver.findElement(By.xpath("//*[@id='hunter-audit-header-button']/button")).click();
        // sleep to load
        Thread.sleep(2000);
        // choose Run One Time option
        driver.findElement(By.xpath("//mat-radio-group/mat-radio-button[2]/label/span[1]")).click();
        // sleep to load
        Thread.sleep(2000);

        // click on Copy to Clipboard
        // driver.findElement(By.xpath("//button/span[@class='mat-button-wrapper']/mat-icon[contains(text(), 'content_copy')]")).click();
        // sleep
        // Thread.sleep(2000);
        // paste copied text from cliboard
        // String copiedText = (String) Toolkit.getDefaultToolkit().getSystemClipboard().getData(DataFlavor.stringFlavor);
        // System.out.println("******copied Text:*******  "+ copiedText);

        // get helm command from the html element
        String helmText = driver.findElement(By.xpath("//textarea")).getText().trim();
        System.out.println("******Helm Text:*******  "+ helmText);

        // *** It takes about 2 minutes to populate the report ***
        // Run pasted text (helm command) on command line
        ProcessBuilder builder = new ProcessBuilder();
        builder.command("bash", "-c", helmText);
        builder.redirectErrorStream(true);
        // print command line output
        Process process = builder.start();
        var exitCode = process.waitFor();
        BufferedReader bufferedReader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
        String outLine;
        while ((outLine = bufferedReader.readLine()) != null) {
            System.out.println("*** command line: *** "+ outLine);
        }
        // print exit code if any
        System.out.println("*** Process exited with code: *** "+ exitCode);


        // close the modal by Esc
        actions.sendKeys(Keys.ESCAPE).perform();
        // sleep to load
        Thread.sleep(5000);

        // Give 5 attempts to try finding data until it works
        boolean anyData = false;
        // retry for up to 1 minute
        for (int i=0; i<6 && !anyData; i++){
            try {
                // verify there's data in the report
                String lastReportDate = driver.findElement(By.xpath("//*[@id='hunter-table-card']/mat-card-content/div[2]/div/table/tbody/tr[1]/td[contains(text(),'" + Year.now().getValue() + "')]")).getText();
                if (lastReportDate.length() > 0) {
                    System.out.println("*** KH returned results on: ***" + lastReportDate);
                }
                anyData = true;
            } catch(Exception e){
                e.printStackTrace();
                System.out.println("*** No report results! ***");
                // sleep for 10 seconds
                Thread.sleep(10000);
            }
            // refresh browser
            driver.navigate().refresh();

        }

        // click on profile and log out
        driver.findElement(By.xpath("//span[contains(@class, 'mat-menu-trigger')]/img[contains(@class, 'profile')]")).click();
        driver.findElement(By.xpath("//span[contains(normalize-space(), 'Sign Out')]")).click();

    }
}
