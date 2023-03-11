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
public final class TestGateKeeper {

    public static String login = System.getenv().getOrDefault("LOGIN", "super.admin@intelletive.com");
    public static String password = System.getenv().getOrDefault("PASSWORD", "123456");

    @Test
    public void shouldRunGateKeeperAndAddConstraintTemplate() throws Exception {
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

        // go to GateKeeper
        driver.findElement(By.xpath("//mat-list/a[@title='GateKeeper']")).click();
        // sleep to load
        Thread.sleep(2000);

        // Run helm command to install GateKeeper
        String helmText = "helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts && " +
                "helm install gatekeeper/gatekeeper --wait --timeout 10m --debug --name-template=gatekeeper --namespace gatekeeper-system --create-namespace --version "+ SeleniumTestRunner.gateKeeperVersion;

        System.out.println("****** Helm Text: *******");
        System.out.println(helmText);

        // *** It takes about 2 minutes to install ***
        // Run helm command on the command line
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
        System.out.println("*** Process exited with code: ***"+ exitCode);

        // sleep to load
        Thread.sleep(5000);

        // refresh browser
        driver.navigate().refresh();

        // sleep to load
        Thread.sleep(5000);


        // verify the status
        String statusText = driver.findElement(By.xpath("//mat-card-content/h1")).getText();
        String notSetupText = "Not Setup";

        if (notSetupText.equals(statusText)) {
            System.out.println("*** Status: GateKeeper is installed but no constrain template is setup yet ***");
        } else {
            System.out.println("*** Status: GateKeeper is " + statusText + " ***");
        }

        // The Install button should now be the Setup button
        // SETUP constraint template
        // click Setup button
        driver.findElement(By.xpath("//span[contains(text(), 'Setup')]")).click();
        // sleep to load
        Thread.sleep(2000);
        // open General menu
        driver.findElement(By.xpath("//span[contains(text(), 'general')]")).click();
        // sleep to load
        Thread.sleep(2000);
        // select containerlimits
        driver.findElement(By.xpath("//span[contains(text(), 'containerlimits')]")).click();
        // sleep to load
        Thread.sleep(2000);
        // Save changes
        driver.findElement(By.xpath("//span[contains(text(), 'Save Changes')]")).click();
        // sleep to load
        Thread.sleep(3000);

        // refresh browser
        driver.navigate().refresh();
        // sleep to load
        Thread.sleep(7000);

        // verify the status
        String updatedStatusText = driver.findElement(By.xpath("//mat-card-content/h1")).getText();
        String setupText = "Setup";

        if (setupText.equals(updatedStatusText)) {
            System.out.println("*** Status: GateKeeper is Setup ***");
        } else {
            System.out.println("*** Status: GateKeeper is " + updatedStatusText + " ***");
        }

        // Should find the saved k8scontainerlimits
        driver.findElement(By.xpath("//td[contains(text(), 'k8scontainerlimits')]")).click();
        // sleep to load
        Thread.sleep(3000);
        // SETUP template constraint
        // add template constraint
        driver.findElement(By.xpath("//span[contains(text(), 'Add More')]")).click();
        // click on name
        driver.findElement(By.xpath("//input[@formcontrolname='name']")).click();
        // add name
        driver.findElement(By.xpath("//input[@formcontrolname='name']")).sendKeys("testing-limit");
        // click on category
        driver.findElement(By.xpath("//input[@formcontrolname='kind']")).click();
        // add category
        driver.findElement(By.xpath("//input[@formcontrolname='kind']")).sendKeys("K8sContainerLimits");
        // click on description
        driver.findElement(By.xpath("//input[@formcontrolname='description']")).click();
        // add description
        driver.findElement(By.xpath("//input[@formcontrolname='description']")).sendKeys("Testing container limit");
        // click on cpu
        driver.findElement(By.xpath("//input[@name='cpu']")).click();
        // add cpu
        driver.findElement(By.xpath("//input[@name='cpu']")).sendKeys("200m");
        // click on memory
        driver.findElement(By.xpath("//input[@name='memory']")).click();
        // add memory
        driver.findElement(By.xpath("//input[@name='memory']")).sendKeys("1Gi");
        // Save changes
        driver.findElement(By.xpath("//span[contains(text(), 'Save Changes')]")).click();
        // sleep to load
        Thread.sleep(3000);

        // refresh browser
        driver.navigate().refresh();
        // sleep to load
        Thread.sleep(7000);

        // Should find the saved testing-limit constraint
        driver.findElement(By.xpath("//td[contains(text(), 'testing-limit')]"));


        // click on profile and log out
        driver.findElement(By.xpath("//span[contains(@class, 'mat-menu-trigger')]/img[contains(@class, 'profile')]")).click();
        driver.findElement(By.xpath("//span[contains(normalize-space(), 'Sign Out')]")).click();

    }
}
