package test;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import runner.SeleniumTestRunner;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

// *** Regular maintenance is required for all locators (locators can be changed with updated code) ***

@RunWith(SeleniumTestRunner.class)
public final class TestWebhookEnforcement {

    public static String login = System.getenv().getOrDefault("LOGIN", "super.admin@intelletive.com");
    public static String password = System.getenv().getOrDefault("PASSWORD", "123456");

    @Test
    public void shouldTestWebHookAndDisplayResults() throws Exception {
        // wait until element is visible
        EventFiringWebDriver driver = SeleniumTestRunner.driver;
        WebDriverWait myWaitVar = new WebDriverWait(driver, 8);

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
        // go to Cluster Info
        driver.findElement(By.xpath("//mat-list/a[@title='Cluster Info']")).click();
        // sleep to load
        Thread.sleep(2000);


        // "compliant" image
        String image = "docker.io/blockloop/nginx-scratch:latest";

        // deploy "compliant" image command
        String deployCompliantImage = "kubectl run blockloopscratch -n default --image blockloop/nginx-scratch:latest";

        // deploy "compliant" image command
        String deployCompliantImageDiffName = "kubectl run blockloopscratchdiffname -n default --image blockloop/nginx-scratch:latest";

        // deploy "non-compliant image command
        String deployNonCompliantImage = "kubectl run nginx1142 -n default --image nginx:1.14.2";

        String toggleThumbLocator = "//mat-slide-toggle[1]/label/span/span/span[@class='mat-slide-toggle-thumb']";
        String toggleCheckboxLocator = "//mat-slide-toggle[1]/label/span/input[@type='checkbox']";

        WebElement toggleThumb = driver.findElement(By.xpath(toggleThumbLocator));
        WebElement toggleCheckbox =driver.findElement(By.xpath(toggleCheckboxLocator));

        // image must be scanned and is compliant before it can be deployed when webhook is enforced
        // *** scan image by trawler ***

        // use altDockerBaserUrl for local testing
        String deployScanImageByTrawler = "docker run --network=host "+ SeleniumTestRunner.trawlerImageUrl +" trawler scan --url="+SeleniumTestRunner.altDockerBaseUrl+" --api-key='myapikey123456' --debug --parallel-scans=1 --cluster-name='default-cluster' --image-url='"+ image +"' || true";

        System.out.println("*** Running ScanImageByTrawler Command... ***  ");
        runCommandLine(deployScanImageByTrawler);

        // *** OFF test - webhook is NOT enforced ***
        // verify the webhook enforcement toggle is OFF (default)
        System.out.println("*** toggleCheckbox attribute is: *** " + toggleCheckbox.getAttribute("aria-checked"));

        if (toggleCheckbox.getAttribute("aria-checked").equals("false")) {
            System.out.println("*** The webhook enforcement toggle is OFF! ***");

            // -- deploy the compliant image on command line --
            System.out.println("*** Deploy a complaint image... ***  ");
            runCommandLine(deployCompliantImage);

            // -- deploy the non-compliant image on command line --
            System.out.println("*** Deploy a non-complaint image... ***  ");
            runCommandLine(deployNonCompliantImage);
        }

        // *** ON test - webhook is enforced ***
        // turn on the toggle
        toggleThumb.click();
        Thread.sleep(4000);
        System.out.println("*** toggleCheckbox attribute is: *** " + toggleCheckbox.getAttribute("aria-checked"));


        // verify the webhook enforcement toggle is ON
        if (toggleCheckbox.getAttribute("aria-checked").equals("true")) {
            System.out.println("*** The webhook enforcement toggle is ON! ***");

            // -- deploy the compliant image on command line --
            System.out.println("*** Deploy a complaint image... ***  ");
            runCommandLine(deployCompliantImageDiffName);

            // -- deploy the non-compliant image on command line --
            System.out.println("*** Deploy a non-complaint image... ***  ");
            runCommandLine(deployNonCompliantImage);
        }


        // click on profile and log out
        driver.findElement(By.xpath("//span[contains(@class, 'mat-menu-trigger')]/img[contains(@class, 'profile')]")).click();
        driver.findElement(By.xpath("//span[contains(normalize-space(), 'Sign Out')]")).click();

    }

    public void runCommandLine(String commandInput) throws IOException, InterruptedException {

        ProcessBuilder builder = new ProcessBuilder();
        builder.command("bash", "-c", commandInput);
        builder.redirectErrorStream(true);

        Process process = builder.start();

        var exitCode = process.waitFor();

        BufferedReader bufferedReader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));

        String outLine;
        while ((outLine = bufferedReader.readLine()) != null) {

            System.out.println("*** command line ***: "+ outLine);

            if (outLine.matches("(.*)denied the request(.*)")) {
                System.out.println("Non-compliant image is NOT deployed!");
            }else if (outLine.matches("pod/(.*)created(.*)")) {
                System.out.println("Compliant image is deployed!");
            }
        }

        // print exit code if any
        System.out.println("*** Process excited with code ***: "+ exitCode);

    }
}
