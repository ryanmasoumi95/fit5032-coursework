# Circular Melbourne: FIT5032 A1.3

This folder contains my work for FIT5032 Assessment 1.3: Basic Application Development Version 2.

Circular Melbourne is a Vue 3 web application that helps users find recycling, reuse and repair services around Melbourne. This version builds on the earlier application by adding user accounts, administrator access, service ratings and basic security checks.

## Main features

* Search and filter services loaded from JSON data.
* Responsive layouts for mobile, tablet and desktop screens.
* A report form with required field, description length and email validation.
* Registration, login and logout with saved user sessions.
* User and admin roles, with the Admin Dashboard restricted to administrators.
* Service ratings with an average score calculated from ratings submitted by different users.
* Basic XSS protection by rejecting markup in plain text report fields.
* Local Storage for saved accounts, sessions, ratings and service searches.

## Running the project

Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/` in your browser.

## Project structure

The main application code is inside the `src` folder.

`components` contains the reusable interface components.

`composables` contains the authentication and rating logic.

`data` contains the service information used by the service finder.

`router` contains the Home and Admin routes and the admin access check.

`utils` contains the unsafe markup check used by the report form.

`views` contains the Home and Admin page views.

This version is a client side university prototype, so account and rating data is stored locally in the browser rather than in a backend database.