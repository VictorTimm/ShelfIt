import { Item } from './types';

/**
 * Format a date string to the iCalendar format (YYYYMMDD)
 */
function formatDate(dateStr: string): string {
  try {
    let date: Date;
    
    // Handle DD-MM-YYYY format
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
    } 
    // Handle YYYY-MM-DD format
    else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
      date = new Date(`${dateStr}T12:00:00Z`);
    } 
    // Try direct parsing as fallback
    else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      console.error(`Invalid date: ${dateStr}`);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
  } catch (error) {
    console.error(`Error formatting date ${dateStr}:`, error);
    return '';
  }
}

/**
 * Escape special characters in text for iCalendar format
 */
function escapeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[,;\\]/g, '\\$&')
    .replace(/\n/g, '\\n');
}

/**
 * Generate an iCalendar file from a list of items
 */
export function generateICS(items: Item[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  console.log(`Generating iCalendar for ${items.length} items`);
  
  // Create events for all items
  const events = items
    .map(item => {
      try {
        // Use reminder date if available, otherwise use regular date
        const eventDate = item.reminder_date || item.date;
        if (!eventDate) {
          console.log(`Item ${item.id} has no valid date`);
          return null;
        }
        
        const formattedDate = formatDate(eventDate);
        if (!formattedDate) {
          return null;
        }
        
        // Create title based on item type
        const title = item.type === 'borrowed' 
          ? `Return ${item.item_name} to ${item.person}`
          : `Get ${item.item_name} back from ${item.person}`;
        
        // Create description with item details
        const description = [
          `Type: ${item.type === 'borrowed' ? 'Borrowed from' : 'Lent to'} ${item.person}`,
          `Category: ${item.category || 'Not specified'}`,
          item.notes ? `Notes: ${item.notes}` : null
        ].filter(Boolean).join('\\n');
        
        // For Google Calendar, we need to set an end date that's the next day
        // for all-day events
        const dateObj = new Date(formattedDate.substring(0, 4) + '-' + 
                                formattedDate.substring(4, 6) + '-' + 
                                formattedDate.substring(6, 8));
        
        dateObj.setDate(dateObj.getDate() + 1);
        const nextYear = dateObj.getFullYear();
        const nextMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
        const nextDay = String(dateObj.getDate()).padStart(2, '0');
        const formattedEndDate = `${nextYear}${nextMonth}${nextDay}`;
        
        console.log(`Event: "${title}" on ${formattedDate} to ${formattedEndDate}`);
        
        // Create the event
        return `BEGIN:VEVENT
UID:${item.id || 'item'}@shelfit.app
DTSTAMP:${now}
DTSTART;VALUE=DATE:${formattedDate}
DTEND;VALUE=DATE:${formattedEndDate}
SUMMARY:${escapeText(title)}
DESCRIPTION:${escapeText(description)}
STATUS:CONFIRMED
TRANSP:TRANSPARENT
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER:-PT12H
END:VALARM
END:VEVENT`;
      } catch (error) {
        console.error(`Error creating event for item ${item.id}:`, error);
        return null;
      }
    })
    .filter(Boolean)
    .join('\n');
  
  // Create the full calendar
  const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ShelfIt//Item Reminders//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:ShelfIt Reminders
X-WR-TIMEZONE:UTC
${events}
END:VCALENDAR`;
  
  return calendar;
} 