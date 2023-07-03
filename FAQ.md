## Errors running installing to local Kubernetes cluster or running in a container on Mac with Apple Silicon chip
Some of the services that are used in M9sweeper do not have versions that support the Apple Silicon architecture natively.

### Workaround (Using Docker Desktop)
Using Docker through Docker Desktop, you can use Rosetta for emulation of x86 images.
This will usually fix the problems, although a small percentage of the time the container will still fail to boot up. (Kiling and restarting will usually fix this).

It is not recommended to use this approach in production environments.

1. Open the Docker Desktop Dashboard
2. Navigate to Settings > Features In development.
3. Check the box next to 'Use Rosetta for x86/amd64 emulation on Apple Silicon'
   1. Note: You must also have Virtualization enabled. This is under Settings > General
4. Apply & Restart
5. THe next time you try to do something that would use Rosetta, macOS should prompt you to install it if it is not already installed.

### Other Container runtimes
For other container runtimes, refer to their documentation if they have support for emulation x86 images.





