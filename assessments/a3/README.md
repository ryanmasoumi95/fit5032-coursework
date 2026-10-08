# Circular Melbourne: FIT5032 Assessment 3

Circular Melbourne is a Vue 3 web application developed for FIT5032 Assessment 3.

The application helps users find recycling, reuse and repair services around Melbourne, submit service reports, save and compare services, locate nearby services on an interactive map and receive recycling guidance. It also provides administrator-only analytics and interactive data tables.

The project builds on the earlier assessment versions and adds Firebase authentication, Firestore role management, serverless email functionality, deployment, geolocation, accessibility improvements, data export, innovation features and continuous integration.

## Live application

Production deployment:

https://circular-melbourne-a3.pages.dev

## Technology stack

- Vue 3
- Vue Router
- Vite
- Firebase Authentication
- Cloud Firestore
- Firebase Security Rules
- Cloudflare Pages
- Cloudflare Pages Functions
- Resend email API
- Leaflet
- OpenStreetMap
- Chart.js
- jsPDF
- jsPDF AutoTable
- GitHub Actions
- Node.js built-in test runner

## Main application features

### Authentication and access control

Users can register, log in and log out using Firebase Authentication.

Registration includes:

- name
- email
- password
- confirm password validation

User profile information and roles are stored in Cloud Firestore.

The application supports:

- regular user access
- administrator access
- role-based navigation
- administrator-only dashboard routes
- Firestore Security Rules that prevent users from changing their own role

Administrators cannot submit service ratings.

### Service discovery

Users can browse recycling, reuse and repair services and filter the available services.

Service cards display information such as:

- service name
- category
- location
- accepted materials
- rating information

### Interactive map and geolocation

The service map uses Leaflet and OpenStreetMap.

Map functionality includes:

- displaying service locations as map markers
- requesting the user's current location
- showing the user's location on the map
- calculating nearby service information
- interacting with service markers

### Service reporting and email

Authenticated users can submit service reports through the report form.

The form includes validation for:

- service selection
- issue type
- description
- email address
- attachment file type
- attachment file size
- unsafe HTML or script markup

Supported attachment formats include PDF, JPG and PNG.

Reports are sent through a Cloudflare Pages Function using the Resend email API.

The serverless function:

- verifies the user's Firebase ID token
- validates submitted report data on the server
- checks allowed issue types
- validates attachments
- sanitises attachment filenames
- reads sensitive server configuration from Cloudflare environment variables

### Administrator dashboard

Administrators have access to an Admin Dashboard containing:

- interactive report data
- service data
- sorting
- global searching
- individual column searching
- pagination
- CSV export
- PDF export
- interactive analytics and charts

## Innovation features

Four extended user-experience features were developed for the innovation requirement.

### 1. Interactive Admin Analytics

The administrator dashboard includes interactive analytics that transform application data into visual summaries and charts.

The feature allows administrators to inspect report and service information through visual data rather than relying only on raw tables.

### 2. Smart Recycling Guide

The Smart Recycling Guide helps users determine how common materials should be handled.

It provides an interactive guidance experience designed to make recycling decisions easier and reduce uncertainty about disposal options.

### 3. Saved Services Shortlist

Users can save useful services to a shortlist.

The shortlist makes it easier to return to preferred recycling, reuse and repair services without repeatedly searching for them.

### 4. Service Comparison

Users can select services and compare them side by side.

The comparison interface helps users evaluate multiple options before deciding which service best matches their needs.

## Accessibility

Accessibility improvements include:

- semantic form labels
- keyboard-accessible controls
- visible focus behaviour
- skip navigation link
- accessible status and validation feedback
- alternative text where required
- keyboard navigation support
- accessible form error communication

The application was developed with WCAG 2.1 AA requirements in mind.

## Security

Security measures include:

- Firebase Authentication
- server-side Firebase ID-token verification
- Firestore Security Rules
- role protection
- server-side form validation
- issue-type allowlists
- file type and file size validation
- attachment filename sanitisation
- rejection of HTML and script markup in plain-text report fields
- environment variables for configuration
- server-side secrets stored in Cloudflare environment bindings

Firebase browser configuration is loaded through Vite environment variables rather than being hard-coded in the source code.

The real local environment file is ignored by Git.

## Automated testing

The project contains automated tests for the report-form markup security utility.

The tests verify that:

- normal report text is accepted
- script markup is rejected
- HTML markup is rejected
- isolated angle brackets are rejected

Run the tests with:

```bash
npm test