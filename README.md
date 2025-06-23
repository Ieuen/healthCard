# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


########################################################################################################
This project:
•	Uses Firebase as the Backend-as-a-Service platform (Firestore, Storage, Authentication, App Check with reCAPTCHA).
•	Integrates Google BigQuery for secure analytics and Looker Studio for data visualization.
•	Implements a modern frontend stack with Vue+Vite and Tailwind CSS (using the color palettes: slate, gray, zinc, neutral, and stone with light/dark mode support).
•	Offers robust, token-based authentication and precise role-based access so that sensitive actions and data (e.g., underwriting services and private member profiles) are only accessible to authorized admin users.
The application serves two main user groups:
•	Admin Users: With full access to registration, reports, member management, underwriting services, QR code scanning, and dashboards.
•	Health Program Members (Public): Who can access their member profile via QR code scanning without a login, with limited details.

Project Stack & Architecture
Backend (Firebase):
•	Cloud Firestore:
o	Stores user profiles, member data, beneficiary details, reports, and logs.
•	Firebase Storage:
o	Hosts files like profile pictures, e-signatures, and documents.
•	Firebase Authentication:
o	Supports email/password and phone authentication (using SMS multi-factor authentication).
o	Provides Google Sign-In (OAuth) for embedding Looker Studio dashboards.
o	Implements token-based session management (e.g., JWT) to secure admin routes.
•	Firebase App Check (reCAPTCHA):
o	Protects against bot submissions and abuse.
•	Google BigQuery & Looker Studio:
o	BigQuery stores and organizes detailed data.
o	Looker Studio displays interactive dashboards embedded in the admin area (secured via role-based access).
Frontend:
•	Vue+Vite:
o	Provides a fast, reactive development environment.
•	Tailwind CSS:
o	Implements a responsive design with a consistent color palette and supports light/dark modes.

User Flows & Security
Registration (Two-Way Verification):
•	Fields:
o	Username, Email, Password, Confirm Password (with robust requirements), First Name, Last Name, Middle Name, Date of Birth, Contact Number, Gender, Profile Picture Upload, and Role (Head Administrator, Administrative Assistant).
o	Agreement to Terms and Conditions (opens a modal with a checkbox).
•	Security & Verification:
o	Use reCAPTCHA.
o	Send verification emails (including secure, tokenized links) and SMS codes (for phone verification).
o	Tokenize sessions to represent user identity and permissions.
o	Passwords are hashed (e.g., with bcrypt) before database storage.
Login:
•	Fields:
o	Username/email and Password.
•	Requirements:
o	Only enable login if the email is verified.
o	Validate passwords against stored (hashed) values.
o	Use tokens to manage session state and protect routes (enforced with routing guards to prevent “forward” access once logged out).
Admin Dashboard & Navigation
A. Vertical Navigation Bar (Left-Side)
Built into the admin dashboard, this vertical nav includes:
1.	Dashboard:
o	Displays key metrics, system status, recent activities, and an embedded Looker Studio dashboard (shown conditionally based on role).
2.	Reports:
o	Contains detailed reports with filtering options:
	Search Functionality: Searches by ID number, reference number, or last name.
	Visualization: Displays members with expired membership or exhausted service balances.
3.	Member Registration:
o	A dedicated page for registering Health Care Program beneficiaries.
B. Horizontal Navigation Bar (Top of Admin Pages)
Components include:
1.	Notification Icon:
o	Opens a modal to notify all users if a member’s balance is exhausted or if membership has expired.
2.	Theme Toggle (Sun/Moon Icons):
o	Switch between light and dark mode.
3.	Circular Profile Picture:
o	Displays the admin’s profile picture; clicking it leads to a profile page showing registration details.
4.	Logout Icon:
o	Logs out the user securely; uses token clearance so that any attempt to navigate to admin pages after logout redirects to the login page.

Detailed Pages & Functionalities
1. Registered Members Page
•	Functionality:
o	List all registered members with filtering by barangay and registration month.
o	Each member listing includes a button or link to access the detailed member profile.
o	Includes a search bar to filter by ID Number, Reference Number, or Last Name.
2. Member Registration (Beneficiary Registration Form)
•	Required Fields:
o	User-generated Fields:
	ID Number (unique), Last Name, First Name, Middle Name, Maiden Name (optional).
o	Address Fields:
	House Number/Street (optional), Barangay (Dropdown from a provided list), concatenated with “Calapan City.”
o	Demographics:
	Gender (Dropdown), Date of Birth (using a date picker), Civil Status (Dropdown), and System-generated Reference Number.
o	File Uploads:
	ID Picture and E-sign.
o	Contact:
	Phone Number.
•	QR Code Generation:
o	Automatically generate a QR code that can be downloaded as PNG, JPEG, or SVG.
o	QR Code Behavior:
	Enables different flows (Admin vs. Public) via secure markers (Custom HTTP headers, User-Agent strings, device fingerprinting, or even an IP allowlist).
•	Membership Constraints:
o	Valid for one year. If not renewed, the member can no longer access services.
o	On registration, each member receives a PHP 7,000 balance that is decremented per service use.
3. Member Profile – Admin Version
Displayed in detail for an admin (accessible either via the Registered Members page or by scanning the QR code using an authorized admin scanner):
•	Displayed Details:
o	Balance, ID Number, Last Name, First Name, Middle Name, Maiden Name, Address (with house number/street [if provided] + Barangay + “Calapan City”), Gender, Date of Birth, Civil Status, Reference Number, ID Picture, E-sign, Phone, and the Generated QR Code.
•	Interactive Features:
o	Update Button:
	Provides editing for Civil Status, Last Name, Middle Name, and Maiden Name (mandatory if updated to “Married”).
o	Beneficiary Registration Modal:
	Fields: Last Name, First Name, Middle Name, Gender, Age (must not exceed 21), Date of Birth, Relationship.
o	Underwriting Services Administration:
	Modal with Service Categories:
	Outpatient Services:
	CT-SCAN (6,500 PHP), CT-SCAN W/ CONTRAST (5,000 PHP), 2D-ECHO (3,000 PHP), ULTRASOUND (1,200 PHP), CHEMO (6,000 PHP), MRI (6,000 PHP), DIALYSIS (7,000 PHP), BLOOD CHEM, X-RAY, EEG, MAMOGRAM, FT4, FT3, TSH (1,500 PHP).
	Inpatient Services:
	Enter service details manually (service type auto-formatted in uppercase) and specify the claim amount.
	Other Services:
	Example: Eye glasses (1,200 PHP maximum).
	Inputs:
	Institution name textbox.
	Amount input per service.
	Dynamic logic: Disable a service input when the member hits the maximum claim (reactivated upon membership renewal).
o	History Display:
	A table listing all acquired services with columns: Claimed (indicator), Service Claimed, Date Claimed, Amount, Institution.
	A list of the member’s registered beneficiaries.
4. QR Code Scanner Page
•	Purpose:
o	Allow the logged-in admin to quickly scan a member’s QR code and navigate to the Member Profile Admin Version.
•	Flow:
o	Admin Flow (Login Required):
	The scanner must include identifiable markers (e.g., custom HTTP headers like X-Scanner-Type: admin, custom User-Agent, device fingerprint).
	Backend checks for valid admin token and device markers.
	If validated, redirect to /admin/scan/... to load the detailed member profile.
	If not logged in, redirect to /admin/login.
o	Member Flow (No Login Required):
	Public scanning on a mobile phone or third-party app directs to a URL like https://yourapp.com/scan?id=12345.
	The backend detects the absence of admin markers and redirects to /user/scan/..., displaying the Member Profile – Member Version.
5. Member Profile – Member Version (Public)
Accessible via public QR code scanning (no login required), displaying:
•	Data:
o	Balance, ID Number, Last Name, First Name, Middle Name, Maiden Name (optional), Address (house/street + Barangay + “Calapan City”), Gender, Date of Birth, Civil Status, ID Picture, E-sign, Phone, and the Generated QR Code.
•	Lists:
o	A list of registered beneficiaries.
o	A table or list view showing claimed services and which services can still be claimed based on the current balance.
VI. Technical & Security Considerations
1.	Token & Session Management:
o	Use secure tokens (e.g., JWT) for admin sessions.
o	Implement routing guards so that logged-out users are redirected to the login page if they attempt to access protected routes.
2.	QR Code Security:
o	Do not embed roles or sensitive data directly in the QR code.
o	Validate QR code requests server-side with additional markers before granting access.
3.	Data Protection:
o	Ensure Firebase Firestore, Storage, and endpoints are secured with strict rules.
o	Regularly audit security settings (e.g., App Check reCAPTCHA, Firebase rules).
4.	User Experience & Responsiveness:
o	Utilize Tailwind CSS for responsive design.
o	Provide clear inline validations on registration and form inputs (e.g., password strength, proper email format).
5.	Analytics & Dashboard Integration:
o	Securely connect BigQuery with Looker Studio.
o	Embed Looker Studio dashboards only for authorized users using Firebase Google Sign-In (OAuth) and role-based logic.

Development Deliverables & Next Steps
1.	Project Setup & Structure:
o	Organize the Vue+Vite project with clearly partitioned modules for pages, components (nav bars, modals), and services (Firebase, QR code handling).
o	Configure Tailwind CSS with designated color palettes and implement light/dark mode switching.
o	Set up the Firebase project with Authentication, Firestore, Storage, App Check, and BigQuery connections.
2.	Implement Features:
o	Registration & Login:
	Build forms adhering to the specified validations and two-way verification (email and phone).
o	Admin Dashboard & Navigation:
	Develop both vertical (side) and horizontal (top) navigation bars to support page routing and state (notifications, theme toggle, profile, logout).
o	Member Management:
	Create pages for Registered Members, Member Registration, and detailed Member Profile (Admin and Member versions).
	Integrate QR code generation and scanning.
o	Underwriting Services:
	Create modals and dynamic forms for administering service claims.




9.6.25
✅services
✅qr save to storage
✅member balance

12.06.25
reports
qr code links
qr code scanner
responsive design
hosting

