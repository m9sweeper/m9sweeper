# Introduction
Automate Minesweeper Testing by Selenium
Test include: Super admin logs in to Minesweeper, clicks around various pages, submit new image to be scanned, and log out.

# Getting Started
1.	Installation process 
2.	Software dependencies
3.	Latest releases
4.	API references


## Setting up local Mac Environment
1. Download Java SE Development kit (use jdk 11 for this project) from https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
2. Set JAVAHOME path on MAC: Open bash_profile "vim ~/.bash_profile", set path with "export JAVE_HOME=$(/usr/libexec/java_home)", save file, update with "source ~/.bash_profile", verify path by "echo $JAVA_HOME"
3. Download Eclipse IDE for Java Developer from https://www.eclipse.org/downloads/packages/release/kepler/sr1/eclipse-ide-java-developers, unzip file, click on .exe file to launch Eclipse
4. Once Eclipse is launched, create a workplace (select directory).
5. Launch workplace and create a Java project under the workplace> give a Project name> select "JRE 11"> Finish> select "Don't Create" module
6. Set up your project folder as your git folder 
7. Download Selenium Java, save unzipped files in your project folder. Add jar files to Eclipse reference libraries. Right click on Java project> Properties> Java Build Path> Libraries Tab> click on ClassPath> Add External JARs> Make sure to add ALL available jar files from the unzip folder (if the unzip file folder location is changed, this path must be updated)
8. Download ChromeDriver: this must match your current Chrome browser version> save unzipped file in your project folder

# Build and Test
1. Launch Eclipse. Under "Test" folder, make a copy of example.TestStarter.java and rename as a new file. Make sure your class name in this file matches the file name. Use it as your test template and build your own test.
2. To execute test the first time in Eclipse as Maven, open the pom.xml file, Run> Run As> maven clean, then maven test OR
  To execute test through command line requires installing maven wrapper https://github.com/takari/maven-wrapper. Go to your project directory, run "mvn clean" then "mvn test"
3. Helpful tool: Selenium IDE- browser extension (https://www.selenium.dev/selenium-ide/) can be used to record/ playback test automation. Generated code may require maintenance. 

## Setting up local windows environment

1. Install OpenJDK 11

        choco install openjdk11

2. Install chrome

        choco install chrome

2. Install chromedriver

        choco install chromedriver
        
Open project in Intellij or Eclipse and/or run tests from command line using git bash provided with git-scm

        ./mvnw test

Maven auto-installs all dependencies and runs the tests. 

# Contribute
TODO: Explain how other users and developers can contribute to make your code better. 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)