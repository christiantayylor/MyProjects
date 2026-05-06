# WESTERN GOVERNORS UNIVERSITY
## D287 – JAVA FRAMEWORKS
### Commit Updates:
B: Updated the included README.md file to the current format (lines 1-4). 

C: Customized 'mainscreen.html' to include the company name in the title, and updated the name of the products/parts offered by the company (lines 8, 12, 19 and 55). 

D: Added an about.html page to the templates folder, added a navigation bar on the mainscreen.html page to allow for easy navigation between the mainscreen.html page and the about.html page (lines 15-16).

E: Added five outsourced parts and products to BootStrapData.java (lines 56-89). 

F: Created a "Buy Now" button next to the products available on mainscreen.html (lines 82-83). A new controller has been added to AddProductController and the Product domain folder. Two new HTML files were created, confirmationbuypart.html and errorbuypart.html, to indicate whether the purchase was successful or not, and return the user to the home page with the updated product count once the inventory is purchased. 

G: Updated part.java to validate the minInv and maxInv values based on what the user puts in for minimum and maximum values, and makes sure no values can be added before the minimum or above the maximum (lines 41-118). I modified the headset to include the maximum (500) and the Ethernet to include the minimum (0) in BootStrapData.java (lines 65-66). I added both maximum (500) and minimum (0) text inputs to InhousePartForm.html and OutSourcedPartForm.html, so the user can set the minimum and maximum fields (lines 44-55 for both files). I renamed the file that persistent storage is saved to (C:\Users\okayc\spring-boot-h2-db.mv.db) to C:\Users\okayc\persistentStorage.mv.db, and then updated application.properties to reflect this on line 6 (spring.datasource.url=jdbc:h2:file:~/persistentStorage.mv.db). Lastly, I added minimum/maximum values to Part.java to ensure that inventory cannot go below 0 or above 500 (lines 41-56). 

H: Added validation to EnufPartsValidator.java (lines 27-39) and ValidEnufParts.java (lines 16-21) to display error messages when inventory goes below the minimum or above the maximum. 

I: Added two unit tests (getSetMinInventory and getSetMaxInventory) to PartTest.java (lines 160-176). 

J: Navigated to the validators folder. Upon opening each file, IntelliJ was able to tell me how many usages each validator had. I searched through each one, and found that DeletePartValidator had no usages, so I deleted the file. Alternatively, ValidDeletePart has 2 usages, so I did not delete that file. 