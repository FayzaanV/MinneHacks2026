# MinneHacks2026

For the theme "Mending Over Ending," we are making an app to extend the lifespan of personal
devices. We will include features such as monitoring battery charge, battery usage, CPU and RAM
usage, device temperature, and storage usage. This will be used to offer recommendations to the
user to extend their device's lifespan.


Problem: 
Every year, millions of tons of e-waste end up in landfills, with laptops being a significant contributor. On average, a consumer will replace their laptop in 3-4 years, often due to a minor issue such as a weak battery, a full hard drive, or overheating. They assume that they need to spend another thousand dollars on a new laptop, but in reality, laptops are very similar to cars, where they need maintenance checks every so often. But many don’t realize there are diagnostics embedded with the OS to keep in check, but an average user doesn’t have time for it. Many ordinary consumers don't realize the possibilities of mending electronics instead of throwing them away.

Solution/what it does:
That’s where DiagnOS comes in, a doctor for your hardware. DiagnOS is a tool that takes all the complex diagnostics that are deep in the settings of the laptop. It doesn’t matter what operating system you are on; we take into account and display all necessary data in real time, and give any needed recommendations to keep the system in shape. By doing these simple yet effective tasks, users can use tis information to help extend the laptop’s life by double the average lifespan of the device, therefore reducing the amount of e-waste produced every year and letting consumers save thousands of dollars that they would have to spend on a new laptop. 

How it was built:
For the frontend, we used HTML and JavaScript for UI and access to other tabs. Python was heavily used as our backend to extract the raw data and the logic. This is because browsers like Chrome/Edge are sandboxed for security, and they cannot read your CPU temperature or battery health, but Python can. Using libraries like psutil ( collects the CPU, RAM, and temperature data across the OS), platform ( to detect the specific OS), WMI (Windows only: to dig deep into the battery history), and Eel(lets Python speak to JavaScript), allowing it to work 100% offline with no latency. 

Challenges we faced
One of the struggles was how difficult it was to get data for the temperature of the CPUs because Windows OS needed a specific WMI call to access, while Mac OS completely blocked it for security reasons. We also attempted to count the number of tabs open to measure the RAM usage, but the modern browsers that prioritize performance and stability hide the memory usage of individual tabs behind multiple extensions. Another was in the frontend with the animations. We wanted a dashboard that felt alive, not static. Implementing real-time animations using Tailwind CSS was a excuriting because of how attentive you had to be with the code, because one little mess up screws up the whole design, which ruins the aesthetic appeal. 

Huge Accomplishments
A huge accomplishment was how we were able to create animations with high quality to showcase the data in real time. This adds an aesthetic appeal to the application because being able to see the battery charge going up and the odometers changing constantly feels like a big accomplish. Another was the error/recomended messages because whenever something happens, like overheating or battery strain, it tells you the error and gives tips on how to stop it and how to reduce the amount of times you will do that in the future.

What Did We Learn?
Building this program taught us how accessibility can change the function of our operating system. Having the ability to extract data from the device itself is a new way to look at the longevity of the device, saving people the hassle and money to go and buy another new laptop

The future with DiagnOS
One thing that we though was a huge opportunity that we wished we had were push notifications because it would alert the user to view an alert from the application and it encourages the user to quickly resolve it to continue keeping the laptop in great quality. We would also dive more deeper with the Mac OS to give it more functionality because many of the data we needed was blocked by the privacy rules. We also would implement more types of metrics to give the application more functionality of the device’s data.

Instructions: 
To run our app, simply download the libraries in the requirements.txt and run main.py!
