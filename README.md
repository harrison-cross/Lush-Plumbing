# Lush Plumbing website

Responsive static website for Firebase Hosting. It uses no build step or npm dependencies.

## Local preview

From this folder, run `python -m http.server 4173 --bind 127.0.0.1` and open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Keep the terminal running while you preview the site.

## Set up Firebase

1. Create a Firebase project and register a **Web app** in the Firebase console.
2. Copy that app's Firebase configuration into `firebase-config.js`, replacing each `YOUR_...` placeholder.
3. Create a Firestore database in the Firebase console. The included `firestore.rules` allows validated enquiry submissions to `serviceEnquiries` and denies public reads, edits and deletes.
4. Install the Firebase CLI if needed (`npm install -g firebase-tools`), then sign in:

   ```sh
   firebase login
   ```

5. From this folder, deploy to your project:

   ```sh
   firebase deploy --only hosting,firestore:rules --project YOUR_PROJECT_ID
   ```

The Firebase web configuration is used in the browser and is not a secret. Do not put service-account credentials in this website. Before launch, configure an authorized Hosting domain and enable Firebase App Check enforcement for Cloud Firestore to help protect the public enquiry endpoint.

## Contact form

With Firebase configured, the form stores enquiries in Firestore. Until then, submitting the form opens a pre-filled email to `Lushplumbing@outlook.com`; the visitor is told to send that email to finish their request. Update the contact details in `index.html` and `app.js` if they change.
