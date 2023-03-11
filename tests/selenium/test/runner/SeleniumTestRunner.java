package runner;

import org.codehaus.plexus.util.FileUtils;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.Description;
import org.junit.runner.Runner;
import org.junit.runner.notification.RunNotifier;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.events.AbstractWebDriverEventListener;
import org.openqa.selenium.support.events.EventFiringWebDriver;

import java.io.File;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

public class SeleniumTestRunner extends Runner {
  // shared vars
  public static EventFiringWebDriver driver;
  public static JavascriptExecutor js;

  //*** base url may need to be updated locally (ngrok) or in pipeline ***
  public static String baseURL = System.getenv().getOrDefault("BASE_URL", "http://localhost:5000");
  public static String altDockerBaseUrl = System.getenv().getOrDefault("DOCKER_BASE_URL", "http://host.docker.internal:5000"); // use when running on local machine
  public static String localpath = java.nio.file.Paths.get(".").toAbsolutePath().normalize().toString();
  public static String filepath = System.getenv().getOrDefault("FILEPATH", localpath + "/screenshots/");
  public static String trawlerImageUrl = System.getenv().getOrDefault("TRAWLERIMAGEURL", "docker.io/m9sweeper/trawler:latest");
  public static String gateKeeperVersion = System.getenv().getOrDefault("GATEKEEPER_VERSION", "3.9.2");

  public static String defaultChromeDriverLoc = System.getProperty("os.name").contains("Windows")
      ? "C:/ProgramData/chocolatey/lib/chromedriver/tools/chromedriver.exe" // windows
      : localpath + "/chromedriver"; // mac/linux
  public static String chromedriverpath = System.getenv().getOrDefault("CHROMEDRIVERPATH", defaultChromeDriverLoc);

  /**
   * Standard constructor
   */
  private Class testClass;
  public SeleniumTestRunner(Class testClass) {
    super();
    this.testClass = testClass;
  }

  /**
   * Run chrome and selenium
   */
  public void setUp() {
    // instantiate chrome driver
    System.setProperty("webdriver.chrome.driver", chromedriverpath);
    ChromeOptions options = new ChromeOptions();

    // run headless in build pipelines
    if (System.getProperty("os.name").toLowerCase().contains("linux")) {
      options.addArguments("--no-sandbox", "--headless", "--disable-dev-shm-usage"); // Bypass OS security model and limit RAM usage on linux
    }

    options.addArguments("--window-size=1920,1080"); //consistent window size across environments
    WebDriver driverRaw = new ChromeDriver(options);
    driver = new EventFiringWebDriver(driverRaw);

    // hoop up implicit waits as well as waits and auto-screenshotting before every click
    driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);

    js = (JavascriptExecutor) driver;

    // take snapshots before every click
    driver.register(new AbstractWebDriverEventListener() {
      @Override
      public void beforeClickOn(WebElement element, WebDriver driver) {
        try {
          System.out.println("SLEEPING BEFORE CLICKING ON " + element.toString());
          Thread.sleep(1000); // add slight timeout before doing things to allow loading indicator to disappear
          takeSnapShot();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }

      @Override
      public void afterClickOn(WebElement element, WebDriver driver) {
        try {
          Thread.sleep(500); // wait a bit after clicking on things
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });
  }

  /**
   * Save screenshot
   */
  private static Integer lastScreenshotId = 0;
  public static void takeSnapShot() throws Exception {
    File srcFile = driver.getScreenshotAs(OutputType.FILE);

    lastScreenshotId = lastScreenshotId + 1;
    String filename = filepath + currentlyRunningTestName + "." + lastScreenshotId.toString() + ".png";
    System.out.println("Writing screenshot " + filename);
    FileUtils.copyFile(srcFile, new File(filename));
  }

  /**
   * Quit selenium/chrome
   */
  public void tearDown() {
    if (driver != null) {
      driver.quit();
    }
  }

  @Override
  public Description getDescription() {
    return Description
        .createTestDescription(testClass, "For running our selenium tests");
  }

  public static String currentlyRunningTestName = "";

  /**
   * Run selenium unit tests, booting up selenium, taking screenshots automatically, and tearing down at end
   * @param notifier
   */
  @Override
  public void run(RunNotifier notifier) {
    System.out.println("running the tests from MyRunner: " + testClass);
    try {
      // start selenium
      setUp();

      // run all the tests
      Object testObject = testClass.newInstance();
      for (Method method : testClass.getMethods()) {
        if (method.isAnnotationPresent(Test.class)) {
          // store some metadata about test and take snapshot
          currentlyRunningTestName = testClass.getSimpleName() + "." + method.getName();
          lastScreenshotId = 0;
          takeSnapShot();

          // run test
          notifier.fireTestStarted(Description.createTestDescription(testClass, method.getName()));
          method.invoke(testObject);
          notifier.fireTestFinished(Description.createTestDescription(testClass, method.getName()));

          // take screenshot at end of each test
          takeSnapShot();
        }
      }
    } catch (Exception e) {
      // take screenshot of errors
      try {
        takeSnapShot();
      } catch (Exception snapshotError) {
        snapshotError.printStackTrace();
      }
      throw new RuntimeException(e);
    } finally {
      // tear down at end
      tearDown();
    }
  }
}
