#!/bin/bash
# Appointment System Testing & Demo Guide

# This guide provides quick commands to test the appointment system

echo "================================"
echo "Appointment Booking System"
echo "Testing & Demo Guide"
echo "================================"
echo ""

echo "📍 STEP 1: Start the Development Server"
echo "cd /path/to/hrm"
echo "npm run dev"
echo ""

echo "📍 STEP 2: Access the Application"
echo "Open: http://localhost:3000"
echo ""

echo "================================"
echo "🧪 USER TESTING FLOW"
echo "================================"
echo ""

echo "1️⃣  LOGIN AS USER"
echo "   - Go to http://localhost:3000/auth/login"
echo "   - Use any existing user credentials"
echo "   - Or register new user at /auth/register"
echo ""

echo "2️⃣  NAVIGATE TO DASHBOARD"
echo "   - After login, you're at /dashboard"
echo "   - Click 'Rendez-vous' in navigation"
echo "   - You'll be taken to /appointments page"
echo ""

echo "3️⃣  BOOK APPOINTMENT"
echo "   - Go to 'Book Appointment' tab"
echo "   - Select a specialist from dropdown"
echo "   - Pick a future date"
echo "   - Select an available time slot"
echo "   - Choose consultation type (initial/follow-up/check-in)"
echo "   - Add optional notes"
echo "   - Click 'Book Appointment'"
echo "   - Should see success message"
echo ""

echo "4️⃣  VIEW APPOINTMENTS"
echo "   - Go to 'My Appointments' tab"
echo "   - Should see your booked appointment"
echo "   - Status should be 'PENDING' (awaiting admin approval)"
echo "   - Can filter by status using buttons at top"
echo ""

echo "================================"
echo "👨‍💼 ADMIN TESTING FLOW"
echo "================================"
echo ""

echo "1️⃣  LOGIN AS ADMIN/SPECIALIST"
echo "   - Go to http://localhost:3000/auth/login"
echo "   - Login with an admin account"
echo "   - Or create new admin at /auth/register with role='admin'"
echo ""

echo "2️⃣  NAVIGATE TO APPOINTMENTS"
echo "   - At /admin dashboard, click 'Rendez-vous' tab"
echo "   - Click 'Accéder à la Gestion des Rendez-vous' button"
echo "   - You'll see /admin/appointments page"
echo ""

echo "3️⃣  VIEW PENDING APPOINTMENTS"
echo "   - Should see table of appointments"
echo "   - Filter for 'Pending' status using button"
echo "   - See appointments waiting for approval"
echo ""

echo "4️⃣  APPROVE APPOINTMENT"
echo "   - Click 'View Details' on a pending appointment"
echo "   - Modal will open with details"
echo "   - Enter a meeting link (zoom, google meet, etc)"
echo "   - Optionally add admin notes"
echo "   - Click 'Confirm Appointment'"
echo "   - Modal closes"
echo "   - User should receive email with meeting link"
echo ""

echo "5️⃣  VIEW CONFIRMED APPOINTMENTS"
echo "   - Filter by 'Confirmed' status"
echo "   - See meeting link and details"
echo "   - Can mark as completed after meeting"
echo ""

echo "================================"
echo "🧪 TESTING SCENARIOS"
echo "================================"
echo ""

echo "SCENARIO 1: Conflict Prevention"
echo "- User 1 books Mon 10:00-11:00 with Specialist A"
echo "- User 2 tries to book Mon 10:00-11:00 with Specialist A"
echo "- Should get error: 'Time slot unavailable'"
echo ""

echo "SCENARIO 2: Status Workflow"
echo "- Book appointment (Status: PENDING)"
echo "- Admin approves (Status: CONFIRMED)"
echo "- After meeting, admin marks complete (Status: COMPLETED)"
echo "- User can only see confirmed appointments in their list"
echo ""

echo "SCENARIO 3: Availability Slots"
echo "- Select a specialist and date"
echo "- Available slots show (default: 9 AM - 5 PM, 1-hour slots)"
echo "- Booked slots are excluded"
echo "- After booking, that slot becomes unavailable"
echo ""

echo "SCENARIO 4: Cancellation"
echo "- Book an appointment"
echo "- In 'My Appointments', find the appointment"
echo "- Click cancel (appears as trash icon or delete button)"
echo "- Status changes to CANCELLED"
echo "- Slot becomes available again for others"
echo ""

echo "================================"
echo "🔍 API TESTING (cURL Commands)"
echo "================================"
echo ""

echo "Get Available Slots:"
echo "curl 'http://localhost:3000/api/appointments/availability?specialistId=ADMIN_ID&date=2024-01-15'"
echo ""

echo "Create Appointment:"
echo "curl -X POST http://localhost:3000/api/appointments \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"specialistId\": \"ADMIN_ID\",
    \"appointmentDate\": \"2024-01-15\",
    \"startTime\": \"10:00\",
    \"duration\": 60,
    \"consultationType\": \"initial\",
    \"notes\": \"Test appointment\"
  }'"
echo ""

echo "Get User Appointments:"
echo "curl 'http://localhost:3000/api/appointments?status=all'"
echo ""

echo "Update Appointment Status:"
echo "curl -X PATCH http://localhost:3000/api/appointments/APPOINTMENT_ID \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"status\": \"confirmed\",
    \"meetingLink\": \"https://zoom.us/...\",
    \"adminNotes\": \"Meeting scheduled\"
  }'"
echo ""

echo "Cancel Appointment:"
echo "curl -X DELETE http://localhost:3000/api/appointments/APPOINTMENT_ID"
echo ""

echo "================================"
echo "📝 CHECKING DATABASE"
echo "================================"
echo ""

echo "To verify data in MongoDB:"
echo ""
echo "1. Open MongoDB Compass or use mongosh"
echo ""
echo "2. Check collections:"
echo "   use nutrited_db"
echo "   db.appointments.find().pretty()"
echo "   db.users.find().pretty()"
echo ""

echo "3. Count appointments:"
echo "   db.appointments.countDocuments()"
echo ""

echo "4. Find appointments by status:"
echo "   db.appointments.find({ status: 'pending' })"
echo ""

echo "================================"
echo "🐛 TROUBLESHOOTING"
echo "================================"
echo ""

echo "❌ Appointments not showing:"
echo "   - Check user is logged in"
echo "   - Verify specialist has role: 'admin'"
echo "   - Check browser console for errors"
echo ""

echo "❌ Availability slots not loading:"
echo "   - Verify specialistId is correct"
echo "   - Check date format (YYYY-MM-DD)"
echo "   - Look at Network tab in DevTools"
echo ""

echo "❌ Admin can't see appointments:"
echo "   - Verify logged in as admin (role='admin')"
echo "   - Check if appointments exist in DB"
echo "   - Verify appointment.specialistId matches current user._id"
echo ""

echo "❌ Meeting link errors:"
echo "   - Ensure link is valid URL"
echo "   - Check for typos"
echo "   - Zoom/Google Meet link should work"
echo ""

echo "================================"
echo "📚 DOCUMENTATION"
echo "================================"
echo ""

echo "For detailed documentation, see:"
echo "- APPOINTMENTS_GUIDE.md       (Complete feature guide)"
echo "- APPOINTMENTS_SETUP_COMPLETE.md (Setup summary)"
echo ""

echo "================================"
echo "✅ QUICK CHECKLIST"
echo "================================"
echo ""

echo "☐ Server is running (npm run dev)"
echo "☐ Can login as user"
echo "☐ Can navigate to /appointments page"
echo "☐ Can see specialist list in dropdown"
echo "☐ Can pick date and see available slots"
echo "☐ Can book appointment successfully"
echo "☐ Can login as admin"
echo "☐ Can navigate to /admin/appointments"
echo "☐ Can see pending appointments"
echo "☐ Can approve with meeting link"
echo "☐ Appointment status updates to confirmed"
echo "☐ Can mark as completed"
echo "☐ Email notifications work (if configured)"
echo ""

echo "================================"
echo "🎉 You're All Set!"
echo "================================"
