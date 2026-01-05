# Appointment System - Quick Reference Guide

## For Users

### How to Request a Consultation

1. **Login** and go to Dashboard
2. **Click "Consultation"** in the navigation
3. **Fill out the form:**
   - **Consultation Type:** Choose from Initial, Follow-up, or Specific Concern
   - **Goals:** Describe what you want to achieve (minimum 10 characters)
   - **Urgency:** Select Low, Medium, or High
   - **Notes:** Add any additional information (optional)
4. **Click "Soumettre la Demande"** (Submit Request)
5. **Track Status:** Click "Statut de Votre Demande" tab to see:
   - ⏳ **Pending** - Waiting for admin assignment
   - ✅ **Assigned** - Shows specialist name, ready to book appointment
   - ❌ **Rejected** - Shows reason for rejection

### How to Book an Appointment

1. Go to **"Rendez-vous"** (Appointments) in navigation
2. Click **"Book Appointment"** tab
3. **Select a Specialist** from the dropdown
4. **Choose a Date** (future dates only)
5. **Select a Time Slot** (available times appear automatically)
6. **Choose Consultation Type:**
   - Initial Consultation (Consultation Initiale)
   - Follow-up (Suivi)
   - Check-in (Check-in)
7. **Add Notes** (optional) - Describe your health concerns
8. **Click "Request Appointment"**
9. **Wait for Confirmation** - Specialist will confirm and add meeting link

### How to View Your Appointments

1. Go to **"Rendez-vous"** in navigation
2. **Filter by Status:**
   - 🟨 Upcoming (À Venir)
   - ⚫ Past (Passés)
   - ⚪ All (Tous)
3. **Click on an appointment** to see:
   - Specialist name and contact
   - Date and time
   - Meeting link (if confirmed)
   - Your notes and specialist's notes
4. **Cancel if needed** - Button available for pending/confirmed appointments

---

## For Admin Users

### Managing Consultation Requests

1. **Go to Admin Dashboard** (if you have admin access)
2. **Click "Demandes de Consultation"** tab
3. **View Pending Requests:**
   - User name and email
   - Consultation type and urgency
   - Goals and notes
   - Submission date and time

#### To Assign a Specialist:
1. Find the pending request
2. **Select a Specialist** from the dropdown
3. **Click "Assigner"** (Assign)
   - Request status changes to "Assigned" (green)
   - Specialist name is displayed
   - User is notified

#### To Reject a Request:
1. Find the pending request
2. **Click "Rejeter"** (Reject)
3. **Enter rejection reason** in the modal
4. Status changes to "Rejected" (red) with reason displayed
5. User can see the rejection reason

### Managing Appointments

1. **Click "Rendez-vous"** tab in Admin Dashboard
2. View all specialist appointments
3. **Upcoming Actions:**
   - Confirm appointments and add meeting links
   - View user and specialist notes
   - Cancel if necessary

### Messaging Users

1. **Click "Messages"** tab
2. Select a user to chat with
3. View conversation history
4. Send direct messages for coordination

---

## Status Meanings

### Consultation Request Status

| Status | Color | Meaning | User Action |
|--------|-------|---------|-------------|
| **Pending** | 🟨 Yellow | Waiting for admin to review and assign | Wait for notification |
| **Assigned** | 🟢 Green | Admin assigned a specialist | Book an appointment |
| **Rejected** | 🔴 Red | Admin rejected with reason | View reason, submit new request |

### Appointment Status

| Status | Color | Meaning |
|--------|-------|---------|
| **Pending** | 🟨 Yellow | User booked, waiting for specialist confirmation |
| **Confirmed** | 🟢 Green | Specialist confirmed, meeting link provided |
| **Completed** | 🔵 Blue | Appointment has occurred |
| **Cancelled** | 🔴 Red | Appointment was cancelled |

---

## Workflow Example

```
Monday: User requests consultation for nutrition goals
          ↓
Tuesday: Admin reviews request, assigns Dr. Marie (specialist)
          ↓
Tuesday Evening: User receives notification, sees "Assigned" status
                  ↓
Wednesday: User books appointment for Friday 2:00 PM
            ↓
Thursday: Dr. Marie confirms appointment, provides Zoom link
          ↓
Friday: User joins Zoom call for consultation
        Specialist takes notes
          ↓
Saturday: Both parties can see notes and appointment marked complete
```

---

## Technical Information

### API Endpoints Used by Frontend

**Consultation Requests:**
- `POST /api/consultation-request` - Submit new request
- `GET /api/consultation-request` - Fetch user's requests (or all if admin)
- `PATCH /api/consultation-request` - Admin assign/reject

**Appointments:**
- `GET /api/appointments?filter=upcoming|past|all` - Fetch appointments
- `POST /api/appointments` - Book appointment
- `PATCH /api/appointments` - Confirm/cancel/complete
- `DELETE /api/appointments?id=...` - Cancel appointment

**Availability:**
- `GET /api/appointments/availability?specialistId=...&date=...` - Get available time slots

---

## Troubleshooting

### "You already have a pending consultation request"
**Solution:** You can only have one pending request at a time. Either:
- Wait for current request to be assigned or rejected
- Contact admin to reject your current request

### "No available specialists"
**Meaning:** No admin users exist in system yet, or they're all fully booked
**Solution:** Contact administrator to add specialists

### "No available slots for this date"
**Meaning:** Specialist is fully booked on that date
**Solution:** Try a different date or select a different specialist

### Appointment not showing in list
**Check:**
1. Are you filtering by correct status?
2. Is it a past appointment? Check "Passés" (Past) filter
3. Log out and back in to refresh

### Haven't received assignment notification
**Note:** Notifications are in-app. Check your consultation request status by:
1. Go to Consultation page
2. Click "Status of Request" tab
3. Look for status change from Pending to Assigned

---

## Tips & Best Practices

✅ **For Users:**
- Be specific in your goals (at least 10 characters) so specialists understand your needs
- Set appropriate urgency to help prioritization
- Add notes about any health conditions or dietary restrictions
- Check appointment details including timezone before confirming

✅ **For Admins:**
- Review pending requests regularly
- Assign specialists based on:
  - Urgency level
  - Specialist expertise
  - Available slots
- Provide clear rejection reasons to help users
- Confirm appointments promptly to minimize delays

---

## System Features

✨ **Current Capabilities:**
- Request-based specialist assignment workflow
- Real-time availability checking
- Appointment booking and confirmation
- Admin management dashboard
- Message-based communication with specialists
- Status tracking throughout workflow
- French language interface

🔄 **Coming Soon:**
- Email notifications for all activities
- 24-hour appointment reminders
- Calendar view for easier scheduling
- In-app notification system
- Appointment history and analytics

---

## Contact & Support

For technical issues or feature requests, contact your system administrator.

**Common Admin Tasks:**
1. Adding new specialists - Add them as admin users in User Management
2. Removing specialists - Use User Management delete function
3. Updating specialist info - Edit through User Management
4. Checking system logs - Monitor server logs for errors

---

**Last Updated:** 2024
**System Version:** 1.0 - Complete
