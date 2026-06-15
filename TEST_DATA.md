# Test Data and Examples

## Test Credentials

Use these credentials to login and test the form:

```
Email: sarah@clinic.org
Password: password
```

Or create a new account using the signup form.

---

## Example Incident Data

### Example 1: Critical Cardiac Device Failure

**Form Fields:**
```
Device Name: CardioSync Pro 3000
UDI: 00643169002985
Manufacturer: CardioSync Medical Systems, Inc.
Model Number: CSP-3000-V
Facility: Mayo Clinic – Rochester, MN
Incident Date: 2026-06-15
Severity: Critical
Description: 
  Implantable cardioverter-defibrillator (ICD) failed to deliver scheduled 
  defibrillation therapy during documented ventricular fibrillation episode. 
  Patient (67M) required manual CPR and external defibrillation. Device 
  displayed E-04 error code post-incident. No permanent patient injury. 
  Device explanted and returned to manufacturer for analysis.
```

**API Call (curl):**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "incidentNumber": "MDR-20260615001",
    "severity": "Critical",
    "description": "Implantable cardioverter-defibrillator (ICD) failed to deliver scheduled defibrillation therapy during documented ventricular fibrillation episode. Patient (67M) required manual CPR and external defibrillation. Device displayed E-04 error code post-incident. No permanent patient injury. Device explanted and returned to manufacturer for analysis.",
    "incidentDate": "2026-06-15",
    "facility": "Mayo Clinic – Rochester, MN",
    "reportedBy": "Dr. Sarah Johnson",
    "deviceName": "CardioSync Pro 3000",
    "manufacturer": "CardioSync Medical Systems, Inc."
  }'
```

---

### Example 2: High Priority Infusion Pump Issue

**Form Fields:**
```
Device Name: MedTech Infusion Pro Plus
UDI: 12345678901234
Manufacturer: Medtronic
Model Number: IPP-5500
Facility: Cleveland Clinic – Cleveland, OH
Incident Date: 2026-06-14
Severity: High
Description:
  Infusion pump failed to alarm when IV line became occluded during 
  patient medication delivery. System continued running in offline mode 
  for approximately 45 minutes before nursing staff noticed discrepancy 
  between programmed and delivered volumes. Patient received 60% less 
  medication than intended. Patient condition deteriorated but recovered 
  after corrective dose administration. Root cause: firmware update 
  introduced race condition in alarm detection logic.
```

**API Call (curl):**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "incidentNumber": "MDR-20260614002",
    "severity": "High",
    "description": "Infusion pump failed to alarm when IV line became occluded during patient medication delivery. System continued running in offline mode for approximately 45 minutes before nursing staff noticed discrepancy between programmed and delivered volumes. Patient received 60% less medication than intended. Patient condition deteriorated but recovered after corrective dose administration.",
    "incidentDate": "2026-06-14",
    "facility": "Cleveland Clinic – Cleveland, OH",
    "reportedBy": "Dr. Michael Chen",
    "deviceName": "MedTech Infusion Pro Plus",
    "manufacturer": "Medtronic"
  }'
```

---

### Example 3: Medium Priority Monitoring System Error

**Form Fields:**
```
Device Name: NeuroMonitor Elite
UDI: 98765432109876
Manufacturer: Boston Scientific
Model Number: NME-2100
Facility: Johns Hopkins Hospital – Baltimore, MD
Incident Date: 2026-06-13
Severity: Medium
Description:
  Patient monitoring system intermittently disconnected from central 
  monitoring station during routine patient care. Connection restored 
  after system restart. No patient harm as bedside monitors remained 
  functional. However, 12-minute window existed where central station 
  was unaware of patient status changes. Affects approximately 240 
  devices in field.
```

---

### Example 4: Low Priority Software Issue

**Form Fields:**
```
Device Name: DiagnosticHub Analytics
UDI: 55555555555555
Manufacturer: Abbott
Model Number: DHA-3000
Facility: Stanford Health Care – Stanford, CA
Incident Date: 2026-06-12
Severity: Low
Description:
  Software interface displays incorrect timestamp on diagnostic reports 
  (shows 24 hours ahead). Data integrity not affected - issue is cosmetic 
  in nature. Workaround: manual correction of timestamp before report 
  distribution. Permanent fix scheduled for next software update (v2.5).
```

---

## How to Test

### Option 1: Test via Web Form

1. **Start both servers**:
   ```bash
   # Terminal 1
   cd /Users/mac/Desktop/Medical\ Device\ Incident\ Investigator/server
   pnpm dev
   
   # Terminal 2
   cd /Users/mac/Desktop/Medical\ Device\ Incident\ Investigator/client
   pnpm dev
   ```

2. **Open browser**: `http://localhost:5173`

3. **Login** with test credentials:
   - Email: `sarah@clinic.org`
   - Password: `password`

4. **Navigate** to "New Incident" page

5. **Fill form** with example data from above

6. **Submit** the form

7. **Verify**:
   - No validation errors
   - Loading spinner appears
   - Redirects to investigation page
   - Incident displays with your data

---

### Option 2: Test via API (cURL)

1. **Get auth token**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "sarah@clinic.org",
       "password": "password"
     }'
   ```

2. **Copy the `token` from response**

3. **Create incident** (use token from step 2):
   ```bash
   curl -X POST http://localhost:3000/api/incidents \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer PASTE_TOKEN_HERE" \
     -d '{
       "incidentNumber": "MDR-20260615001",
       "severity": "Critical",
       "description": "Test incident",
       "incidentDate": "2026-06-15",
       "facility": "Mayo Clinic – Rochester, MN",
       "reportedBy": "Dr. Test User",
       "deviceName": "Test Device",
       "manufacturer": "Test Manufacturer"
     }'
   ```

4. **Verify response** contains incident ID and all fields

---

### Option 3: Test via Postman

1. **Create new POST request**:
   - URL: `http://localhost:3000/api/incidents`
   - Method: `POST`

2. **Add headers**:
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

3. **Add body** (JSON):
   ```json
   {
     "incidentNumber": "MDR-20260615001",
     "severity": "Critical",
     "description": "Test incident from Postman",
     "incidentDate": "2026-06-15",
     "facility": "Mayo Clinic – Rochester, MN",
     "reportedBy": "Dr. Test User",
     "deviceName": "CardioSync Pro 3000",
     "manufacturer": "CardioSync Medical Systems, Inc."
   }
   ```

4. **Send request** and verify 201 response

---

## Test Cases to Verify

### ✅ Happy Path
- [ ] Form validation passes
- [ ] Incident created successfully
- [ ] Redirect to investigation page works
- [ ] Incident data persists in database

### ❌ Error Cases
- [ ] Submit with empty required fields → shows error
- [ ] Submit without authentication → 401 error
- [ ] Submit with invalid token → token refresh triggered
- [ ] Network error during submit → error message displayed

### 🔐 Security Tests
- [ ] Token required for endpoint (401 without token)
- [ ] Invalid token rejected (401)
- [ ] Expired token refreshed automatically
- [ ] CORS headers present in response

---

## Expected API Response

**Success (201 Created)**:
```json
{
  "id": "clp1234567890abcdef",
  "incidentNumber": "MDR-20260615001",
  "severity": "Critical",
  "status": "Open",
  "description": "...",
  "incidentDate": "2026-06-15T00:00:00.000Z",
  "facility": "Mayo Clinic – Rochester, MN",
  "reportedBy": "Dr. Sarah Johnson",
  "deviceName": "CardioSync Pro 3000",
  "manufacturer": "CardioSync Medical Systems, Inc.",
  "createdAt": "2026-06-15T14:30:00.000Z",
  "updatedAt": "2026-06-15T14:30:00.000Z"
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Missing required field: severity"
}
```

**Unauthorized (401)**:
```json
{
  "error": "Unauthorized"
}
```

---

## Database Verification

Check if incidents were created:

```sql
-- SQLite
SELECT id, incidentNumber, severity, deviceName, facility, createdAt 
FROM Incident 
ORDER BY createdAt DESC 
LIMIT 10;
```

