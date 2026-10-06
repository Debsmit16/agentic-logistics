# Logistics Management System — Master PRD

**Document:** `PRD.md`  
**Version:** 1.0  
**Status:** Master Product + Engineering Specification  
**Purpose:** This single document is the source of truth for building the complete logistics warehouse and last-mile delivery management system.

---

# 1. BUILD INSTRUCTION

You are an AI software engineering agent building this application from this PRD.

Treat this document as the **single source of truth**.

## Rules

1. Build the application according to this document.
2. Do not invent major business functionality that is not specified here.
3. If a minor implementation detail is unspecified, choose a sensible production-grade implementation without changing the business workflow.
4. Do not remove requirements merely because they are inconvenient to implement.
5. Build the system incrementally, keeping the application runnable after each phase.
6. Use TypeScript throughout the application.
7. Use strict typing.
8. Do not use mock data as a substitute for real functionality in production flows.
9. Do not hard-code business data such as partner names, statuses, warehouse names, or users.
10. Use database-backed configuration where appropriate.
11. Every important state-changing action must be validated server-side.
12. Never rely only on frontend permission checks.
13. Every important business action must create an audit/history record.
14. Keep the architecture modular so additional logistics partners can be integrated later.
15. Do not build offline synchronization in V1.
16. Electron is a desktop wrapper around the Next.js application, not a separate business application.
17. The delivery interface must be mobile-first and suitable for low-end Android phones.
18. The warehouse interface must work on desktop, tablet, and mobile.
19. The owner/admin interface must be responsive.
20. Prioritize reliability, simplicity, and traceability over visual complexity.

---

# 2. PRODUCT SUMMARY

The system is a complete warehouse and last-mile logistics management platform.

The business receives parcels from logistics/e-commerce partners such as Ekart, Delhivery, and future partners.

The operational lifecycle is:

```text
Partner
  ↓
Parcel Received
  ↓
Barcode/AWB Scanned
  ↓
Weight Recorded
  ↓
Parcel Stored
  ↓
Parcel Sorted
  ↓
Delivery Batch Created
  ↓
Delivery Boy Assigned
  ↓
Out for Delivery
  ↓
 ┌──────────────────────┐
 ↓                      ↓
Delivered              Failed
 ↓                      ↓
POD + COD          Reattempt / Return
                        ↓
                 Warehouse / Partner
```

The system must provide a complete traceable history for every parcel.

---

# 3. PRIMARY GOALS

The system must:

- Reduce manual paperwork.
- Make parcel processing fast.
- Prevent parcels from getting lost inside the warehouse.
- Know the exact status of every parcel.
- Know the physical warehouse location of every stored parcel.
- Make delivery assignment simple.
- Give delivery personnel a very simple mobile interface.
- Track failed deliveries and reattempts.
- Track COD collection and settlement.
- Provide owner/manager visibility.
- Support multiple logistics partners.
- Be extensible for partner APIs.
- Work for users with little technical knowledge.
- Support Bengali, Hindi, and English UI.
- Maintain complete operational history.

---

# 4. TECHNOLOGY STACK

## Required stack

### Frontend / Application
- Next.js
- TypeScript
- App Router

### Styling
- Tailwind CSS
- Use a consistent component system.
- Prefer accessible, reusable components.

### Database
- PostgreSQL

### ORM
- Prisma

### Desktop
- Electron

Electron must primarily wrap the deployed/local Next.js application interface.

Do not duplicate the business logic inside Electron.

### Mobile
The delivery interface should be a responsive mobile-first web application/PWA.

A native Android application is not required for V1.

### Authentication
Use a secure session-based authentication architecture appropriate for Next.js.

Passwords must be securely hashed.

### File storage
Use object storage for:
- Delivery photographs
- Signatures
- Documents
- Parcel images
- Other uploaded evidence

The storage provider must be configurable.

---

# 5. ARCHITECTURE

Use a modular architecture.

```text
                    USERS
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
    Browser        Electron        Mobile
                     Wrapper         PWA
       │              │              │
       └──────────────┼──────────────┘
                      ↓
                 NEXT.JS APP
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       UI Layer   Server/API   Background
                      │          Jobs
                      ↓
                   PRISMA
                      ↓
                 POSTGRESQL
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
      Storage      Partners    Notifications
```

Business logic must be centralized in reusable server-side services.

Do not place critical business rules only inside UI components.

---

# 6. USER ROLES

The system must support role-based access control.

## 6.1 Owner

Full access.

Can:
- View all dashboards
- Manage users
- Manage roles
- Manage warehouses
- Manage partners
- Manage parcels
- Manage delivery
- Manage COD
- View all reports
- Configure system
- View audit logs

## 6.2 Admin

Broad administrative access.

Can:
- Manage operational configuration
- Manage users
- Manage parcels
- Manage warehouses
- Manage partners
- View reports

Critical owner-only settings may be restricted.

## 6.3 Warehouse Manager

Can:
- Receive parcels
- Weigh parcels
- Store parcels
- Move parcels
- Find parcels
- Sort parcels
- Create dispatch batches
- Manage returns
- View warehouse reports
- Assign parcels to delivery operations

## 6.4 Warehouse Staff

Can:
- Receive parcels
- Scan parcels
- Weigh parcels
- Store parcels
- Move parcels
- Sort parcels
- Find parcels
- Process returns

They must not access financial/admin functions.

## 6.5 Delivery Manager

Can:
- View delivery workload
- Create delivery batches
- Assign delivery boys
- Monitor delivery status
- Handle failed deliveries
- Schedule reattempts
- Process delivery returns

## 6.6 Delivery Boy

Can only access assigned delivery operations.

Can:
- View assigned parcels
- Scan parcel
- View customer details
- Call customer
- Navigate to customer
- Start delivery
- Verify OTP
- Record COD
- Capture POD
- Mark delivered
- Mark failed
- Record failure reason
- Return parcels

A delivery boy must not see other employees' private operational data.

## 6.7 Accountant

Can:
- View COD
- Record/verify collections
- Reconcile COD
- View settlements
- View financial reports

## 6.8 Customer

No full internal account is required for basic tracking.

Customers can use a public tracking page using a tracking/AWB number.

---

# 7. CORE DESIGN PRINCIPLE: SIMPLE FOR EVERYONE

This is a critical requirement.

The system must be usable by people who:

- Have limited computer experience.
- Have limited English knowledge.
- Are not technically educated.
- Mainly use Android phones.
- May work quickly under warehouse pressure.

## UI principles

- Large buttons.
- Large readable text.
- Clear icons.
- Short labels.
- One major task per screen.
- Minimal typing.
- Barcode scanning wherever possible.
- Large success/error feedback.
- Avoid technical terminology.
- Avoid unnecessary fields.
- Avoid complex navigation.
- Keep important actions within 1–3 taps.

Examples:

Use:

**Receive Parcel**

instead of:

**Create Shipment Record**

Use:

**Move Parcel**

instead of:

**Update Inventory Location**

Use:

**Send for Delivery**

instead of:

**Create Dispatch Manifest**

Use:

**Why did delivery fail?**

instead of:

**Select Delivery Exception Code**

---

# 8. LANGUAGE SUPPORT

Initial UI languages:

- English
- Bengali
- Hindi

The user should be able to select language.

The language architecture must allow additional languages later.

Do not hard-code UI strings throughout components.

Use centralized translation resources.

---

# 9. AUTHENTICATION

Required:

- Login
- Logout
- Password reset
- Session management
- Role-based access
- Account activation/deactivation

Optional future:

- OTP login
- Two-factor authentication
- Passkeys

## Login screen

```text
LOG IN

Phone / Email
[________________]

Password
[________________]

[ LOG IN ]

Forgot Password?
```

For delivery workers, phone-based login can be supported if required.

---

# 10. MAIN NAVIGATION

Navigation must change according to role.

## Owner/Admin

- Dashboard
- Parcels
- Warehouse
- Delivery
- Partners
- Customers
- COD & Finance
- Employees
- Reports
- Notifications
- Settings
- Audit Log

## Warehouse Staff

- Home
- Receive
- Find Parcel
- Store
- Move
- Sort
- Returns

## Delivery Boy

- Home
- My Deliveries
- Parcel Details
- Delivery
- Failed
- Returns

---

# 11. PARCEL IDENTIFICATION

Every parcel must have:

- Internal unique ID
- Partner AWB/tracking number
- Partner
- Barcode/QR information where available

Example:

```text
Internal ID: PAR-000001
Partner: EKART
AWB: EK123456789
```

AWB must be unique within the appropriate partner scope.

Duplicate scans must be detected.

---

# 12. PARCEL MASTER DATA

A parcel may contain:

- Internal ID
- AWB
- Partner
- Sender name
- Sender phone
- Receiver name
- Receiver phone
- Address
- Address line 1
- Address line 2
- City
- State
- Pincode
- Latitude/longitude if available
- Parcel type
- Weight
- Volumetric weight
- Chargeable weight
- COD/prepaid
- COD amount
- Current status
- Current warehouse
- Current physical location
- Delivery batch
- Assigned delivery boy
- Created timestamp
- Updated timestamp

Sensitive data should only be shown to authorized users.

---

# 13. PARCEL STATUS MODEL

Initial status set:

```text
EXPECTED
RECEIVED
WEIGHED
STORED
SORTED
READY_FOR_DISPATCH
ASSIGNED
OUT_FOR_DELIVERY
DELIVERED
DELIVERY_FAILED
REATTEMPT_SCHEDULED
RETURN_TO_WAREHOUSE
RETURNED_TO_PARTNER
CANCELLED
DAMAGED
MISSING
```

Not every transition is allowed.

Example:

```text
RECEIVED → WEIGHED
WEIGHED → STORED
STORED → SORTED
SORTED → READY_FOR_DISPATCH
READY_FOR_DISPATCH → ASSIGNED
ASSIGNED → OUT_FOR_DELIVERY
OUT_FOR_DELIVERY → DELIVERED
OUT_FOR_DELIVERY → DELIVERY_FAILED
DELIVERY_FAILED → REATTEMPT_SCHEDULED
DELIVERY_FAILED → RETURN_TO_WAREHOUSE
RETURN_TO_WAREHOUSE → STORED
RETURN_TO_WAREHOUSE → RETURNED_TO_PARTNER
```

Invalid state transitions must be rejected server-side.

---

# 14. PARCEL EVENT HISTORY

Every significant parcel event must be recorded.

Example:

```text
10:15 AM
Parcel Received
By: Suman

10:18 AM
Weight Recorded: 2.45 KG
By: Suman

10:22 AM
Stored
Location: A-04-02

2:15 PM
Assigned
Delivery Boy: Rahul

3:01 PM
Out for Delivery

5:21 PM
Delivered
OTP verified
COD: ₹799
```

Events must not be silently deleted.

Corrections should create new audit records.

---

# 15. RECEIVING MODULE

Primary warehouse action:

**RECEIVE PARCEL**

## Screen

```text
RECEIVE PARCEL

[ SCAN BARCODE ]

AWB
[________________]

Partner
[ Select ]

Receiver
[________________]

Phone
[________________]

COD
[ ₹________ ]

Weight
[ ______ ] KG

[ RECEIVE PARCEL ]
```

## Preferred workflow

1. Scan barcode.
2. Look up shipment if already imported.
3. Display known information.
4. Confirm identity.
5. Record weight.
6. Confirm receipt.
7. Create event.
8. Move to storage step.

If shipment is unknown, allow controlled manual receiving based on permissions.

---

# 16. BARCODE SCANNING

Support:

- Phone camera
- USB barcode scanner
- Bluetooth barcode scanner where supported

Scanner input should behave like keyboard input where possible.

Camera scanning should be available on supported devices.

After scan:

```text
SCAN SUCCESSFUL

AWB:
EK123456789

[ CONTINUE ]
```

Invalid/unknown:

```text
PARCEL NOT FOUND

You can:
[ SEARCH AGAIN ]
[ ENTER MANUALLY ]
```

Duplicate:

```text
PARCEL ALREADY RECEIVED

Status:
Stored

Location:
A-04-02
```

---

# 17. WEIGHING

V1:

- Manual weight entry.

Future:

- Digital weighing machine integration.

Store:

- Actual weight
- Unit
- Volumetric weight
- Chargeable weight
- Recorded by
- Timestamp

Weight should be positive and within sensible configured limits.

Changing weight after dispatch should require permission and create an audit event.

---

# 18. WAREHOUSE STRUCTURE

Support:

```text
Warehouse
  └── Zone
       └── Rack
            └── Shelf/Bin
```

Example:

```text
Warehouse A
Zone B
Rack 04
Shelf 02
```

Every location has:

- Unique code
- Name
- Type
- Capacity (optional)
- Active/inactive state

---

# 19. STORE PARCEL

Workflow:

```text
SCAN PARCEL
     ↓
SCAN LOCATION
     ↓
CONFIRM
```

Example:

```text
PARCEL
EK123456789

PUT IN:

Warehouse A
Rack A04
Shelf 02

[ CONFIRM STORAGE ]
```

The system records current location.

---

# 20. MOVE PARCEL

Worker:

1. Scan parcel.
2. Scan new location.
3. Confirm.

Previous location is retained in history.

Never silently overwrite movement history.

---

# 21. FIND PARCEL

Search by:

- AWB
- Internal parcel ID
- Customer phone
- Customer name
- Barcode

Result:

```text
PARCEL FOUND

EK123456789

Status:
Stored

Location:
Warehouse A
Rack A04
Shelf 02

[ VIEW HISTORY ]
```

---

# 22. SORTING

Sorting can be based on:

- Pincode
- Area
- City
- Route
- Delivery zone
- Partner
- Other configured grouping

Sorting screen should show workload:

```text
TODAY'S SORTING

700001   84
700002   61
700003   42
700004   73
```

Scanning a parcel should automatically identify its sorting destination where configured.

---

# 23. DELIVERY BATCHES

A delivery batch groups parcels assigned for a delivery operation.

Batch contains:

- Batch ID
- Date
- Warehouse
- Delivery boy
- Route/area
- Parcels
- COD total
- Status
- Created by
- Start time
- Completion time

Example:

```text
BATCH
DLV-20261006-001

Rahul
Central Kolkata

42 Parcels
COD ₹31,450

[ START BATCH ]
```

---

# 24. DELIVERY ASSIGNMENT

Manager selects:

- Delivery area
- Parcels
- Delivery boy
- Optional route
- Start date/time

System must prevent assigning the same parcel to two active delivery batches.

---

# 25. DELIVERY BOY MOBILE APP

The delivery UI must be extremely simple.

Home:

```text
GOOD MORNING, RAHUL

Today's Deliveries
42

COD
₹31,450

[ START DELIVERY ]

[ MY PARCELS ]

[ RETURNS ]
```

Use large touch targets.

Avoid dense tables.

---

# 26. DELIVERY BOY PARCEL LIST

Show:

- Customer
- Area
- Short address
- COD
- Status

Example:

```text
RAHUL SHARMA
700001

COD ₹799

[ OPEN ]
```

The delivery boy should not need to search through hundreds of unrelated records.

---

# 27. DELIVERY DETAILS

Display:

- Customer name
- Phone
- Address
- Pincode
- COD amount
- Parcel ID/AWB
- Special instruction if configured

Buttons:

```text
[ CALL ]
[ NAVIGATE ]
[ DELIVER ]
[ FAILED ]
```

---

# 28. NAVIGATION

The system may open an installed maps application using the customer's address/coordinates.

Do not build a complete maps engine in V1.

Provide:

**Navigate**

and hand off to the device's map application.

---

# 29. DELIVERY PROCESS

Workflow:

```text
OPEN PARCEL
     ↓
CALL / NAVIGATE
     ↓
REACH CUSTOMER
     ↓
VERIFY DELIVERY
     ↓
OTP IF REQUIRED
     ↓
COLLECT COD
     ↓
POD
     ↓
MARK DELIVERED
```

---

# 30. OTP

If OTP delivery is enabled for a parcel:

```text
ENTER CUSTOMER OTP

[ _ _ _ _ ]

[ VERIFY ]
```

Invalid OTP:

> Incorrect OTP. Please try again.

OTP must be validated server-side.

Do not expose OTP in delivery-boy UI unless explicitly permitted.

---

# 31. PROOF OF DELIVERY

Support configurable POD methods:

- OTP
- Signature
- Photo
- GPS
- Timestamp

A partner/business configuration may specify which are mandatory.

Delivery cannot be marked complete until required POD conditions are satisfied.

---

# 32. COD

COD parcel contains:

- Expected COD
- Collected amount
- Payment mode
- Collection timestamp
- Delivery person
- Settlement status

Payment modes:

- Cash
- UPI
- Other configured methods

If collected amount differs from expected amount, require a reason and elevated review.

---

# 33. FAILED DELIVERY

Delivery boy taps:

**FAILED**

Show large predefined reasons:

- Customer unavailable
- Customer refused
- Wrong address
- Phone unreachable
- House/shop closed
- Customer requested later delivery
- Other

Optional note.

Do not require long typing.

---

# 34. REATTEMPT

Manager can choose:

- Retry next day
- Retry on selected date
- Return to warehouse
- Return to partner

A failed parcel must remain traceable.

---

# 35. RETURNS

Return workflow:

```text
FAILED
  ↓
RETURN TO WAREHOUSE
  ↓
SCAN AT WAREHOUSE
  ↓
RETURN RECEIVED
  ↓
STORE
  ↓
REATTEMPT OR RETURN TO PARTNER
```

Return reason must be recorded.

---

# 36. CUSTOMER TRACKING

Public page:

```text
TRACK YOUR PARCEL

Tracking Number
[____________]

[ TRACK ]
```

Display:

```text
EK123456789

✓ Parcel Received
✓ At Warehouse
✓ Sorted
✓ Out for Delivery
○ Delivered
```

Do not expose sensitive internal information.

---

# 37. CUSTOMER DATA

Customer record may contain:

- Name
- Phone
- Address
- City
- State
- Pincode
- Location
- Shipment history

Avoid unnecessary customer data collection.

---

# 38. PARTNER MANAGEMENT

Partners are configurable.

Examples:

- Ekart
- Delhivery
- Future logistics partners

Partner record:

- Name
- Code
- Contact
- Active/inactive
- API integration settings
- Import format
- Service rules
- Billing configuration

Do not hard-code partner-specific logic throughout the application.

Use an integration layer.

---

# 39. PARTNER INTEGRATION

The architecture must support:

- REST API
- Webhooks
- CSV
- Excel
- Manual entry

Future partner adapter structure:

```text
PartnerIntegration
 ├── authenticate()
 ├── importShipments()
 ├── updateShipment()
 ├── getShipmentStatus()
 ├── sendDeliveryStatus()
 └── reconcile()
```

Not every partner will necessarily support every method.

API credentials must be stored securely.

---

# 40. BULK IMPORT

Admin/authorized staff can upload CSV/XLSX files.

Process:

1. Upload.
2. Detect columns.
3. Validate.
4. Preview.
5. Identify errors.
6. Confirm import.
7. Import valid records.
8. Report failures.

Example:

```text
IMPORT COMPLETE

1,248 imported

13 need attention

5 duplicate AWB
4 missing phone
4 invalid pincode
```

Never partially import silently.

---

# 41. DASHBOARD

## Owner dashboard

Display:

- Today's received
- In warehouse
- Ready for dispatch
- Out for delivery
- Delivered
- Failed
- Returns
- COD expected
- COD collected
- COD pending

Example:

```text
TODAY

1,248 Received
518 In Warehouse
301 Out for Delivery
267 Delivered
34 Failed
12 Returned

COD
₹1,84,500 Expected
₹1,62,000 Collected
₹22,500 Pending
```

Each metric should be clickable.

---

# 42. WAREHOUSE DASHBOARD

Show:

- New parcels
- Unstored parcels
- Stored parcels
- Sorting pending
- Ready for dispatch
- Returns
- Missing/unlocated
- Aging parcels

---

# 43. DELIVERY DASHBOARD

Show:

- Total assigned
- Out for delivery
- Delivered
- Failed
- Reattempt
- Returns
- Delivery success percentage
- Delivery boy performance

---

# 44. SEARCH

Global search must support:

- AWB
- Parcel ID
- Phone
- Customer
- Pincode
- Delivery batch
- Delivery boy

Search results must show current status.

---

# 45. REPORTS

## Parcel

- Received
- Delivered
- Failed
- Returned
- Pending
- Aging

## Warehouse

- Location-wise parcels
- Occupancy
- Unlocated parcels
- Movement history

## Delivery

- Delivery boy performance
- Area performance
- Success rate
- Failed reasons
- Reattempts

## COD

- Expected
- Collected
- Pending
- Settlement
- Differences

## Partner

- Partner parcel volume
- Delivery performance
- Returns
- COD
- Pending shipments

Exports:

- CSV
- XLSX
- PDF where appropriate

---

# 46. PARCEL AGING

Calculate parcel age from receiving time.

Categories should be configurable.

Default:

```text
0–1 day
2–3 days
4–7 days
7+ days
```

7+ day parcels should be prominently flagged.

---

# 47. EXCEPTION MANAGEMENT

Track:

- Missing parcel
- Damaged parcel
- Wrong parcel
- Duplicate scan
- Weight mismatch
- Wrong location
- Unexpected parcel
- COD mismatch
- Failed integration
- Failed delivery

Exceptions should have:

- Type
- Parcel
- Description
- Created by
- Assigned person
- Status
- Resolution
- Timestamps

---

# 48. EMPLOYEE MANAGEMENT

Employee data:

- Name
- Phone
- Email
- Role
- Employee ID
- Joining date
- Active/inactive
- Warehouse
- User account

Future support may include:

- Attendance
- Incentives
- Salary
- Leave

These are not mandatory for V1 unless explicitly enabled.

---

# 49. NOTIFICATIONS

System notifications:

- Parcel received
- Parcel assigned
- Delivery started
- Delivery failed
- Return received
- COD pending
- Aging parcel
- Integration error

Future external channels:

- SMS
- WhatsApp
- Email

Notification providers must be configurable.

---

# 50. AUDIT LOG

Important changes must record:

- User
- Action
- Entity
- Entity ID
- Previous value where relevant
- New value where relevant
- Timestamp
- Optional IP/device information

Examples:

```text
User changed parcel weight
User reassigned delivery
User changed COD
User cancelled parcel
User changed warehouse location
```

Audit records should be protected from ordinary users.

---

# 51. DATABASE MODEL

Use Prisma with PostgreSQL.

Initial models should include at minimum:

```text
User
Role
Permission
Employee
Partner
PartnerIntegration
Customer
Warehouse
WarehouseZone
WarehouseRack
WarehouseShelf
Parcel
ParcelEvent
ParcelLocationHistory
DeliveryBatch
DeliveryAssignment
DeliveryAttempt
DeliveryFailureReason
Return
CODTransaction
Settlement
Notification
Exception
AuditLog
```

Additional models may be added where necessary.

---

# 52. DATABASE PRINCIPLES

Use:

- UUIDs or robust IDs for internal records.
- Proper foreign keys.
- Unique constraints.
- Indexes for high-frequency searches.
- Created/updated timestamps.
- Soft deletion where appropriate.
- Transactions for multi-step critical operations.

Important indexes should exist for:

- AWB
- Internal parcel ID
- Customer phone
- Parcel status
- Warehouse/location
- Delivery batch
- Assigned delivery boy
- Created date
- Partner

---

# 53. TRANSACTIONAL OPERATIONS

Operations such as these must use database transactions:

- Receiving a parcel
- Moving a parcel
- Assigning a parcel
- Completing delivery
- Recording COD
- Returning a parcel
- Importing shipment data

Example:

When delivery is completed:

1. Validate assignment.
2. Validate delivery state.
3. Validate OTP/POD.
4. Record COD.
5. Update parcel status.
6. Create parcel event.
7. Create audit record.

All required operations should succeed together or roll back.

---

# 54. API / SERVER REQUIREMENTS

Use Next.js server-side APIs/services.

Representative endpoints/actions:

```text
POST /api/auth/login
POST /api/auth/logout

GET  /api/parcels
POST /api/parcels
GET  /api/parcels/:id

POST /api/parcels/:id/receive
POST /api/parcels/:id/weigh
POST /api/parcels/:id/store
POST /api/parcels/:id/move
POST /api/parcels/:id/sort
POST /api/parcels/:id/assign
POST /api/parcels/:id/out-for-delivery
POST /api/parcels/:id/deliver
POST /api/parcels/:id/fail
POST /api/parcels/:id/reattempt
POST /api/parcels/:id/return

GET  /api/warehouses
POST /api/warehouses

GET  /api/delivery-batches
POST /api/delivery-batches

GET  /api/partners
POST /api/partners

GET  /api/reports/*
```

Exact implementation may use Route Handlers and/or Server Actions where appropriate.

Do not expose privileged database operations directly to the client.

---

# 55. VALIDATION

Validate all critical data server-side.

Examples:

- AWB required.
- Weight must be positive.
- COD cannot be negative.
- Phone number must be valid according to configured country rules.
- Pincode must have valid format.
- Parcel cannot be delivered twice.
- Parcel cannot be assigned to two active batches.
- Inactive users cannot operate.
- Delivery boy cannot modify another delivery boy's assignment.
- Warehouse location must exist before storage.
- COD settlement cannot exceed authorized amount without exception handling.

---

# 56. ERROR MESSAGES

Never show raw technical errors to normal users.

Bad:

```text
PrismaClientKnownRequestError
```

Good:

```text
We couldn't save the parcel.
Please try again.
```

Specific:

```text
This parcel has already been received.
```

```text
This parcel is assigned to another delivery boy.
```

```text
The warehouse location could not be found.
```

Technical errors should be logged internally.

---

# 57. LOADING STATES

Every async action must have visible feedback.

Examples:

```text
Receiving parcel...
Saving...
Checking OTP...
Loading parcels...
Uploading photo...
```

Prevent duplicate submission while an operation is processing.

---

# 58. EMPTY STATES

Example:

```text
NO PARCELS FOUND

There are no parcels matching your search.
```

Avoid blank screens.

---

# 59. MOBILE UX

Delivery interface:

- Large buttons.
- Minimum comfortable touch target.
- Bottom navigation where useful.
- Avoid wide tables.
- Use cards.
- Keep important actions at bottom.
- Support camera scanning.
- Support device calling.
- Support external navigation.

---

# 60. ACCESSIBILITY

Support:

- Keyboard navigation where applicable.
- Proper labels.
- Good contrast.
- Screen-reader-friendly semantic HTML.
- Focus states.
- Large text.
- Avoid color-only status indicators.

Every status should have text/icon as well as color.

---

# 61. ELECTRON REQUIREMENTS

Electron is only a desktop wrapper.

Requirements:

- Launch the Next.js application.
- Provide desktop window.
- Use secure Electron configuration.
- Disable unnecessary Node access from renderer.
- Use context isolation.
- Use secure preload only where needed.
- Do not expose arbitrary filesystem/Node APIs to web content.
- Provide production build packaging.
- Provide app icon.
- Support Windows first.

Future hardware integrations may use Electron/native capabilities, such as:

- USB barcode scanners
- Printers
- Digital weighing machines

Do not implement hardware integrations until specifically required.

---

# 62. PRINTING

The system should be designed to support printing later.

Potential print documents:

- Parcel labels
- Warehouse location labels
- Delivery manifests
- Return labels
- Reports
- Receipts

V1 can use browser/Electron printing.

Thermal printer integration can be added as a dedicated module later.

---

# 63. SECURITY

Required:

- Secure password hashing.
- Secure sessions.
- CSRF protection where applicable.
- Server-side authorization.
- Input validation.
- Rate limiting for sensitive endpoints.
- Secure file upload validation.
- File size restrictions.
- MIME/type validation.
- Secret management through environment variables.
- HTTPS in production.
- Database access restrictions.
- Regular backups.
- No secrets in source code.
- No API keys in client bundles.
- Audit logging.

---

# 64. PRIVACY

Only collect data required for business operation.

Sensitive information must be restricted by role.

Public tracking must never expose:

- Internal employee information
- Internal warehouse details
- Full sensitive customer data
- Internal notes
- Financial information not intended for customer

---

# 65. BACKUPS

Production database must have automated backups.

Backup strategy should support:

- Regular automated backups.
- Retention policy.
- Restore testing.
- Disaster recovery documentation.

---

# 66. ENVIRONMENT CONFIGURATION

Use:

```text
.env.local
.env.example
```

Never commit actual secrets.

Example:

```text
DATABASE_URL=

AUTH_SECRET=

STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=

PARTNER_API_BASE_URL=
PARTNER_API_KEY=

NEXT_PUBLIC_APP_URL=
```

Only variables explicitly intended for browser use should use `NEXT_PUBLIC_`.

---

# 67. OBSERVABILITY

Production should log:

- Authentication failures
- API errors
- Database errors
- Integration errors
- Background job failures
- Critical business exceptions

Do not log sensitive credentials or unnecessary customer data.

---

# 68. PERFORMANCE

The application should remain responsive with large datasets.

Requirements:

- Pagination for large lists.
- Server-side filtering.
- Server-side search.
- Database indexes.
- Avoid loading thousands of parcels into the browser.
- Lazy-load heavy components.
- Optimize images.
- Cache safe read-heavy data where appropriate.

---

# 69. MULTI-WAREHOUSE

The database architecture must support multiple warehouses even if the business starts with one.

Users can be assigned to warehouses.

Parcels can be associated with a warehouse.

Warehouse-specific operations must respect access permissions.

---

# 70. MULTI-PARTNER

The system must support many partners.

Do not make database fields like:

```text
ekartParcel
delhiveryParcel
```

Instead:

```text
partnerId
partnerAwb
partnerMetadata
```

Partner-specific details may be stored in structured fields where appropriate.

---

# 71. CONFIGURABLE BUSINESS RULES

Where practical, configurable values should not be hard-coded.

Examples:

- Delivery failure reasons
- Parcel aging thresholds
- Required POD type
- COD rules
- Warehouse locations
- Delivery zones
- Partner settings
- Supported languages

---

# 72. DASHBOARD DESIGN

The dashboard should prioritize operational information.

Do not overload it with decorative charts.

Important information first:

1. Parcels requiring action.
2. Delivery performance.
3. Warehouse status.
4. COD.
5. Exceptions.
6. Analytics.

---

# 73. ROLE-SPECIFIC HOME SCREENS

Do not show every feature to every user.

### Warehouse Staff

```text
RECEIVE
FIND PARCEL
STORE
MOVE
SORT
RETURNS
```

### Delivery Boy

```text
MY DELIVERIES
START DELIVERY
FAILED
RETURNS
```

### Owner

```text
TODAY'S OPERATIONS
PARCELS
DELIVERIES
COD
EXCEPTIONS
REPORTS
```

---

# 74. HOME SCREEN PRIORITY

Every role's home screen should answer:

> "What do I need to do right now?"

Do not make users search through menus to perform their daily work.

---

# 75. NOTIFICATIONS AND ALERTS

Use priority levels:

- Informational
- Warning
- Critical

Examples:

Informational:

> Parcel received.

Warning:

> Parcel has been in warehouse for 4 days.

Critical:

> 7 parcels are unlocated.

---

# 76. EXTERNAL INTEGRATION DESIGN

Integrations should be isolated.

Example:

```text
src/
  integrations/
    ekart/
    delhivery/
    generic/
```

Each integration should have:

- Authentication
- Import
- Export/status update
- Webhook processing
- Error handling
- Retry strategy
- Logging

Do not let external partner failures break the core parcel system.

---

# 77. WEBHOOKS

Future partner webhooks may update:

- Shipment status
- Delivery status
- Return status
- Cancellation
- Other partner events

Webhook handling must:

- Authenticate/verify source where supported.
- Validate payload.
- Be idempotent.
- Record event.
- Avoid duplicate processing.

---

# 78. IDEMPOTENCY

Critical operations must be safe against duplicate requests.

For example:

If the same delivery confirmation request is received twice, the system must not:

- Deliver the parcel twice.
- Collect COD twice.
- Create duplicate settlement records.

---

# 79. BULK OPERATIONS

Authorized users should be able to perform bulk actions where appropriate:

- Assign multiple parcels.
- Create delivery batch from multiple parcels.
- Import shipments.
- Export reports.

Bulk operations must show confirmation before irreversible actions.

---

# 80. IRREVERSIBLE ACTIONS

Actions such as:

- Cancel parcel
- Return to partner
- Delete user
- Disable warehouse
- Delete configuration

must require confirmation.

Prefer soft-delete/deactivation for important business records.

---

# 81. TESTING REQUIREMENTS

Implement:

## Unit tests

For:
- Status transitions
- COD calculations
- Permission checks
- Validation
- Business rules

## Integration tests

For:
- Database operations
- Parcel lifecycle
- Authentication
- Delivery workflow
- COD

## End-to-end tests

At minimum:

1. Login.
2. Receive parcel.
3. Weigh.
4. Store.
5. Sort.
6. Assign.
7. Delivery.
8. OTP.
9. COD.
10. Complete delivery.

Also test:

- Failed delivery
- Reattempt
- Return
- Duplicate scan
- Permission violation

---

# 82. ACCEPTANCE TEST: COMPLETE PARCEL

The system passes the primary acceptance test when this can happen successfully:

```text
Partner shipment imported
       ↓
Warehouse receives parcel
       ↓
Barcode scanned
       ↓
Weight recorded
       ↓
Parcel stored
       ↓
Parcel sorted
       ↓
Delivery batch created
       ↓
Delivery boy assigned
       ↓
Delivery boy scans parcel
       ↓
Customer contacted
       ↓
Customer reached
       ↓
OTP verified
       ↓
COD collected
       ↓
POD captured
       ↓
Parcel marked Delivered
       ↓
Owner dashboard updated
       ↓
COD settlement updated
       ↓
Complete parcel history available
```

---

# 83. FAILURE ACCEPTANCE TEST

Test:

```text
Parcel
 ↓
Out for Delivery
 ↓
Customer unavailable
 ↓
Failed reason recorded
 ↓
Return to warehouse
 ↓
Warehouse scans return
 ↓
Reattempt scheduled
 ↓
New delivery batch
 ↓
Delivered
```

History must show the complete sequence.

---

# 84. LOW-LITERACY ACCEPTANCE TEST

A new warehouse worker should be able to perform:

1. Login.
2. Receive parcel.
3. Scan parcel.
4. Weigh parcel.
5. Store parcel.

without requiring another employee to explain complicated software terminology.

A new delivery boy should be able to:

1. Login.
2. Open today's deliveries.
3. Open customer.
4. Navigate.
5. Complete delivery.
6. Enter OTP.
7. Record COD.

with minimal training.

---

# 85. MVP SCOPE

The MVP must include:

## Authentication
- Login
- Roles
- Permissions

## Parcel
- Receive
- Scan
- Search
- Weight
- Status
- History

## Warehouse
- Warehouse
- Zone
- Rack
- Shelf/bin
- Store
- Move
- Find
- Sort

## Delivery
- Delivery batches
- Assignment
- Delivery-boy mobile UI
- Out for delivery
- Delivered
- Failed
- Reattempt
- Return

## COD
- Expected
- Collected
- Settlement
- Basic reconciliation

## Dashboard
- Operational dashboard
- Warehouse dashboard
- Delivery dashboard

## Tracking
- Public parcel tracking

## Partner
- Partner records
- CSV/XLSX import
- Integration-ready architecture

## Reports
- Basic operational reports
- CSV/XLSX export

## Security
- RBAC
- Audit logs
- Validation
- Secure authentication

---

# 86. POST-MVP FEATURES

Do not block MVP on these.

Potential next phase:

- Direct Ekart integration
- Direct Delhivery integration
- WhatsApp
- SMS
- Email notifications
- Digital weighing-machine integration
- Thermal printer integration
- Advanced route optimization
- Live delivery map
- Advanced customer portal
- Automated partner reconciliation
- Multi-branch analytics
- Advanced accounting
- Invoice/GST
- Attendance
- Salary/incentive
- Fleet management
- Fuel management
- Reverse logistics
- AI features
- Voice interface
- OCR label reading

---

# 87. FUTURE AI FEATURES

AI must not be forced into V1.

Possible future uses:

- Route optimization.
- Delivery time prediction.
- Parcel volume forecasting.
- Warehouse capacity prediction.
- OCR shipping labels.
- Automatic data extraction.
- Anomaly detection.
- Fraud detection.
- Voice-assisted warehouse operation.
- Intelligent support assistant.

---

# 88. DEVELOPMENT PHASES

Build in this order.

## Phase 1 — Foundation

- Next.js project
- TypeScript
- Tailwind
- Prisma
- PostgreSQL
- Authentication
- User roles
- Layout/navigation
- Error handling
- Basic audit infrastructure

## Phase 2 — Core Parcel

- Parcel model
- Parcel events
- Receive
- Scan
- Weight
- Search
- Status transitions

## Phase 3 — Warehouse

- Warehouse
- Zone
- Rack
- Shelf
- Storage
- Movement
- Find
- Sorting

## Phase 4 — Delivery

- Delivery batches
- Assignment
- Delivery boy mobile UI
- Delivery details
- Navigation
- Delivery
- OTP
- POD
- Failed delivery
- Reattempt
- Return

## Phase 5 — COD

- COD
- Collection
- Settlement
- Reconciliation

## Phase 6 — Dashboard & Reports

- Owner dashboard
- Warehouse dashboard
- Delivery dashboard
- Reports
- Exports

## Phase 7 — Partner

- Partner management
- CSV/XLSX import
- Integration abstraction
- Webhook-ready architecture

## Phase 8 — Electron

- Secure Electron wrapper
- Windows packaging
- Desktop launcher
- Printing groundwork

## Phase 9 — Hardening

- Testing
- Security
- Performance
- Error handling
- Backup
- Production deployment

---

# 89. CODING STANDARDS

Use:

- TypeScript strict mode.
- Reusable components.
- Reusable server services.
- Clear naming.
- Small focused modules.
- Server-side validation.
- Centralized authorization.
- Centralized status transition logic.
- Centralized error handling.
- Centralized translations.
- Environment configuration.
- Prisma migrations.

Avoid:

- Giant components.
- Duplicate business logic.
- Hard-coded credentials.
- Hard-coded partner logic.
- Direct database access scattered throughout UI.
- Any client-side-only security.
- Unnecessary dependencies.
- Unmaintainable generated code.

---

# 90. FOLDER STRUCTURE

A reasonable structure:

```text
src/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── parcels/
│   ├── warehouse/
│   ├── delivery/
│   ├── partners/
│   ├── customers/
│   ├── finance/
│   ├── employees/
│   ├── reports/
│   ├── settings/
│   └── track/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── scanner/
│   └── layout/
│
├── features/
│   ├── auth/
│   ├── parcels/
│   ├── warehouse/
│   ├── delivery/
│   ├── partners/
│   ├── customers/
│   ├── finance/
│   └── reports/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── permissions/
│   ├── validation/
│   ├── storage/
│   ├── notifications/
│   └── integrations/
│
└── types/
```

The exact structure can be adjusted if a better production architecture is justified.

---

# 91. PRISMA REQUIREMENTS

The Prisma schema must represent the actual business domain.

Do not create an oversimplified single `Shipment` table.

Use relational models for:

- Users
- Roles
- Partners
- Customers
- Warehouses
- Locations
- Parcels
- Parcel events
- Delivery
- COD
- Returns
- Exceptions
- Audit

Use enums where appropriate for stable state values.

Use relations and foreign keys correctly.

---

# 92. DATA INTEGRITY

The system must prevent:

- Duplicate AWBs where uniqueness is required.
- Delivery of already delivered parcels.
- Assignment of the same parcel to multiple active delivery batches.
- Storage in inactive locations.
- Actions by inactive employees.
- Unauthorized COD modification.
- Unauthorized status transitions.

---

# 93. UI STATUS COLORS

Colors should communicate meaning but never be the only indicator.

Example:

- Green = completed
- Blue = active/in progress
- Yellow = warning
- Red = failed/critical
- Gray = inactive

Always include text/icon.

---

# 94. CONFIRMATION PATTERNS

For important operations:

```text
Are you sure?

This will mark the parcel as delivered.

[ CANCEL ] [ CONFIRM DELIVERY ]
```

Do not use confirmation dialogs for every trivial action.

---

# 95. PERFORMANCE TARGETS

Target:

- Fast initial page load.
- Fast parcel search.
- Fast barcode lookup.
- Responsive dashboard.
- No unnecessary full-page refreshes.
- Pagination for large data.
- Optimized queries.

Critical warehouse actions should feel immediate.

---

# 96. DEPLOYMENT

Production architecture:

```text
Users
 │
 ├── Browser
 ├── Electron
 └── Mobile/PWA
       │
       ↓
   Next.js Application
       │
       ↓
     Prisma
       │
       ↓
   PostgreSQL
       │
       ├── Object Storage
       ├── Notifications
       └── Partner APIs
```

Electron is packaged separately but uses the same application/backend.

---

# 97. DEVELOPMENT ENVIRONMENT

Provide:

```text
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

And appropriate scripts for:

- Development
- Build
- Production
- Prisma generation
- Prisma migration
- Database seed
- Test
- Lint
- Electron development
- Electron build

---

# 98. SEED DATA

Development seed data may include:

- Demo owner
- Demo manager
- Demo warehouse
- Demo locations
- Demo partner
- Demo parcels
- Demo delivery boy

Clearly mark seed/demo accounts.

Never use demo credentials in production.

---

# 99. README REQUIREMENTS

Generate a README containing:

- Project description
- Features
- Stack
- Requirements
- Installation
- Environment variables
- Database setup
- Prisma commands
- Development
- Electron development
- Production build
- Testing
- Deployment
- Troubleshooting

---

# 100. FINAL QUALITY STANDARD

The finished application must not feel like a generic CRUD dashboard.

It should feel like a real logistics operation platform.

A warehouse worker should be able to process parcels quickly.

A manager should know what needs attention.

A delivery boy should be able to complete a delivery with minimal interaction.

The owner should be able to understand the business from the dashboard.

Every parcel should be traceable.

Every important action should be accountable.

The system should be extensible to new partners and additional warehouses.

---

# 101. FINAL IMPLEMENTATION DIRECTIVE

Build this application as a production-quality system.

Start with the foundation and implement the phases in order.

After each phase:

1. Run type checking.
2. Run linting.
3. Run relevant tests.
4. Check Prisma schema/migrations.
5. Verify authorization.
6. Verify the main user flow.
7. Fix errors before moving forward.

Do not implement the entire application as one giant generated change.

Maintain clean architecture throughout development.

When a requirement is ambiguous, preserve the business intent described in this document and choose the simplest reliable implementation.

The final result must be a complete:

**Warehouse + Parcel + Sorting + Dispatch + Last-Mile Delivery + COD + Returns + Partner-Ready Logistics Management System**

built using:

**Next.js + TypeScript + Prisma + PostgreSQL + Electron wrapper**

with a **simple, low-literacy-friendly user experience**.
