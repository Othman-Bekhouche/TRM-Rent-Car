# TRM Rent Car - Web Platform Project Plan

## Business Goals & Vision
- **Identity:** Premium, modern, dark automotive design style tailored for "TRM Rent Car" to convey professionalism, elegance, and trust.
- **Customer Experience:** Users can effortlessly browse the vehicle fleet, check availability, make reservations online, and receive automated email notifications.
- **Admin Operations:** A powerful CRM intended for the business owner to seamlessly manage operations, vehicles, reservations, and inventory.
- **Future-Proofing:** Architecture designed to systematically grow from a scalable MVP into a comprehensive enterprise platform with GPS and Accounting integrations.

---

## Technical Stack
- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS (configured for a dark, premium aesthetic)
- **Backend / Database:** Supabase (Self-hosted), PostgreSQL
- **Auth & Storage:** Supabase Auth, Supabase Storage
- **Infrastructure:** Docker (for local development & isolated services)
- **Deployment:** Future deployment to a VPS with a Custom Domain

---

## 1. User Roles
1. **Guest (Unregistered):** Can browse the public vehicle catalog, view individual car details, check availability, and read business info.
2. **Customer (Registered):** Can make vehicle reservations, manage their personal profile, view upcoming/past bookings, upload necessary documents (like driver's licenses), and manage their reservations in the Customer Area.
3. **Admin (Business Owner):** Has unrestricted access to the CRM dashboard. Can perform full CRUD (Create, Read, Update, Delete) operations on the vehicle fleet, approve or decline reservations, manage customer data, track inventory, and access all future integrations.

---

## 2. Main Modules
- **Public Website:** Landing page, premium vehicle catalog (list/grid views), individual vehicle detail pages, availability calendar, and company information.
- **Customer Booking Area:** Authentication portal, centralized customer dashboard, reservation tracking, and profile management.
- **Admin CRM / Operations Dashboard:** Secure back-office interface featuring fleet management, reservation oversight, customer relationship database, and business tracking metrics.
- **Email Notifications Module:** Triggered automated emails for booking confirmations, cancellations, and status updates.
- **Future-Ready Modules:** Planned architecture for GPS Tracking and Financial Accounting integrations.

---

## 3. Functional Breakdown
- **Authentication & Security:** Email/Password based login via Supabase Auth, with strict Row-Level Security (RLS) in PostgreSQL securing tenant/user data.
- **Fleet Management System:** Capture vehicle data such as Make, Model, Year, Transmission, Fuel Type, Seats, Daily Rate, Status (Available/Maintenance/Rented), and multiple image support via Supabase Storage.
- **Reservation Engine:** Date-picker logic to calculate total rental days and costs, while preventing double-bookings and managing reservation statuses (Pending, Confirmed, Completed, Cancelled).
- **Automated Webhooks:** Edge functions/webhooks listening to database changes to trigger customer-facing emails via standard SMTP or services like Resend/SendGrid.

---

## 4. MVP Scope (Phase 1)
*Focus: Core operations, taking the business online, and replacing manual processes.*
- **Premium Public Website & Dark Mode UI:** High-end landing page, vehicle catalog with filtering, and detailed car pages.
- **Booking Flow:** Customers can select dates, review total pricing, and submit a reservation request (payment handled offline/in-person initially).
- **Customer Area:** Basic dashboard to view booking status.
- **Admin Operations Dashboard:** 
  - Manage Fleet Inventory (Add, edit, and safely remove vehicles).
  - Manage Bookings (Approve, reject, update).
  - Basic Customer Roster.
- **Email Notifications:** Automated email summarizing the requested booking sent to both the user and the admin.
- **Deployment:** Complete Docker local setup and transition to VPS base infrastructure.

---

## 5. Phase 2 Scope (Refinement & Automation)
*Focus: Financial transactions and operational streamlining.*
- **Integrated Payments:** Integration with payment platforms (e.g., Stripe) to accept security deposits or full payments online.
- **Document Verification Flow:** Customers can securely upload their ID/Driver's License for pre-approval by the admin.
- **Damage Assessment Tool:** Give admins securely uploaded photo-logs of the vehicle before checkout and after check-in.
- **SMS & Advanced Reminders:** Automated reminders sent 24 hours prior to pickup or drop-off times.

---

## 6. Phase 3 Scope (Enterprise Addons)
*Focus: Utilizing the future-ready data hooks to build enterprise functionality.*
- **GPS Integration Module:** Connect to third-party OBD2/GPS tracking APIs (e.g., Traccar or Samsara) to display real-time vehicle locations, speed monitoring, and geofencing directly inside the Admin Dashboard.
- **Accounting Module:** Custom ledger tracking revenues, operational expenses (e.g., fuel, car washes, maintenance), or synchronization interfaces to QuickBooks/Xero.
- **Advanced Analytics:** Utilization rate charting, predictive maintenance reminders based on mileage, and revenue forecasting.

---

## 7. Recommended Development Order
1. **Planning & Setup:** 
   - Initialize Vite + React & TypeScript. 
   - Configure Tailwind CSS with the premium dark theme. 
   - Set up local Docker-based Supabase.
2. **Database & Auth Foundation:** 
   - Build PostgreSQL tables: `profiles`, `vehicles`, `bookings`. 
   - Hook up Supabase Auth and configure RLS.
3. **Admin CRM Core (Backoffice first):** 
   - Build Admin layout to add, edit, and upload images for Vehicles.
   - Establish the foundation so there is actual data for the frontend to consume.
4. **Public Layout & Catalog (Frontend):** 
   - Build the high-aesthetic landing page and vehicle catalog drawing from the Supabase backend.
5. **Booking Engine:** 
   - Build the calendar picker logic, cost calculators, and the checkout form inserting into the `bookings` table.
6. **Customer Client Area:** 
   - Build the user-facing dashboard for managing personal reservations.
7. **Triggers & Notifications:** 
   - Implement Database Webhooks to trigger Postmark/SendGrid/Resend confirmation emails.
8. **Final Polish & VPS Deployment:** 
   - Micro-animations, responsive layout checks on mobile devices, and the final Docker composition deployment to the production VPS server.
