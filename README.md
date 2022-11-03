# fcc-tracker

A simple freecodeCamp progress tracking API

Deployed at: https://fcc-tracker.herokuapp.com/api/progress/avermeulen

Usage: https://fcc-tracker.herokuapp.com/api/progress/:username




#### How to add a new Free Code Camp Course Tracking

- `codecamp-progess-scraper.js` file:



  1. create a new JSON variable which will generate data using a function, for example:

  ```javascript
  const catPhotoApp = createJSONFile('Learn HTML by Building a Cat Photo App', 69);

  // createJSONFile() function takes two parameters, 'the name of the course' and how many steps are available for that course.

  ```

  2. add course data into the `scrape()` function inside the `context` object.
  3. Calculate the course progress for a user using `calculateProgress()` function. See example below
  
  ```javascript
    context.cafeMenu = calculateProgress(activities, cafeMenu);

  ```

  4. Do the same calculation mentioned above in the resolver function, see example below.

    ```javascript
    resolve({
     cafeMenu: calculateProgress(activities, cafeMenu),
     .....,
     .....,
    })
    ```

  5. New course progress should be displayed, we use `index.html` to show the progress results.
    > Add `<th>` and `<td>` for the new course. Course progress should be displayed using {{}} for templating.