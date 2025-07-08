import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { generateICS } from '../../lib/icalendar';
import { getAllItems } from '../../lib/storage';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Fetching items for user ID:', user.id);

    // Use the same function that works in the main app to get items
    // This ensures consistency between the main view and calendar export
    const items = await getAllItems();

    // Log items for debugging
    console.log(`Found ${items?.length || 0} items for user ${user.id}`);
    
    if (items && items.length > 0) {
      console.log('Items found:');
      items.forEach(item => {
        console.log(`- ID: ${item.id}, Name: ${item.item_name}, Type: ${item.type}, Returned: ${item.returned}, Date: ${item.date}`);
      });
    } else {
      console.log('No items found for user');
    }

    // Include ALL items in calendar export
    const calendarItems = items || [];
    
    console.log(`Using ${calendarItems.length} items for calendar export`);
    
    // If no real items found, add a dummy item to test the calendar format
    if (calendarItems.length === 0) {
      console.log('No items found for calendar - adding a dummy test item');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      
      calendarItems.push({
        id: 'test-dummy-item',
        item_name: 'Dummy Test Item',
        person: 'Calendar Test',
        date: tomorrowFormatted,
        type: 'borrowed',
        category: 'Other',
        returned: false,
        agreement_status: 'accepted',
        lender_id: 'test',
        borrower_id: user.id
      });
    } else {
      console.log('Calendar items:');
      calendarItems.forEach(item => {
        console.log(`- ${item.item_name} (${item.type}): due ${item.date || item.reminder_date}`);
      });
    }
    
    // Generate ICS content
    const icsContent = generateICS(calendarItems);
    
    // Log ICS content for debugging
    console.log('ICS content length:', icsContent.length);
    console.log('ICS content preview:', icsContent.substring(0, 200) + '...');

    // Return the ICS file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="shelfit-reminders.ics"'
      }
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 