import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function called when group is full - marks for confirmation
async function markGroupForConfirmation(group: any) {
  try {
    console.log(`🎉 Group ${group.id} is now FULL (${group.currentMembers}/${group.numberOfPeople})!`);
    console.log(`   Attraction: ${group.attractionName}`);
    console.log(`   Date: ${group.date} at ${group.time}`);
    console.log(`   Total members: ${group.members.length}`);
    console.log(`   Waiting for manual confirmation from facility...`);
    
    // Update all bookings for this group to pending_confirmation status
    for (const member of group.members) {
      console.log(`   - ${member.name}: ${member.numberOfTickets} tickets`);
      await updateBookingStatus(member.userId, group.id, 'pending_confirmation');
    }
    
    console.log(`✅ Group ${group.id} marked as full - awaiting facility confirmation`);
    console.log(`📋 Admin action required: Contact facility to confirm availability, then manually send tickets`);
  } catch (error) {
    console.error(`Error marking group for confirmation ${group.id}:`, error);
  }
}

// Helper function to manually send tickets (called by admin after facility confirmation)
async function sendTicketsToAllMembers(group: any) {
  try {
    console.log(`📧 Manually sending tickets for group ${group.id} to all ${group.members.length} members...`);
    
    for (const member of group.members) {
      // Generate unique ticket IDs for each ticket holder
      const tickets = member.ticketHolders.map((holder: any, index: number) => ({
        ticketId: `GT-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
        groupId: group.id,
        holderName: holder.name,
        isChild: holder.isChild,
        attractionName: group.attractionName,
        location: group.location,
        date: group.date,
        time: group.time,
        qrCode: generateQRCodeData(group.id, member.userId, index),
        generatedAt: new Date().toISOString()
      }));
      
      // Save tickets to KV store
      const ticketsKey = `tickets:${member.userId}:${group.id}`;
      await kv.set(ticketsKey, JSON.stringify(tickets));
      
      // Log simulated email/SMS (in production, this would call a real email/SMS service)
      console.log(`📧 EMAIL to ${member.email}:`);
      console.log(`   Subject: Twoje bilety na ${group.attractionName} są gotowe! 🎉`);
      console.log(`   Tickets: ${tickets.length} bilet(y/ów)`);
      console.log(`   QR Codes: ${tickets.map((t: any) => t.ticketId).join(', ')}`);
      
      console.log(`📱 SMS to ${member.email} (phone):`);
      console.log(`   GroupTrip: Grupa zapełniona! Twoje ${tickets.length} bilet(y/ów) na ${group.attractionName} czeka w aplikacji. Bilet #${tickets[0].ticketId}`);
      
      // Update all bookings for this user and group to mark tickets as sent
      await updateBookingStatus(member.userId, group.id, 'tickets_sent');
    }
    
    console.log(`✅ Successfully sent tickets to all members of group ${group.id}`);
  } catch (error) {
    console.error(`Error sending tickets for group ${group.id}:`, error);
  }
}

// Generate QR code data (simplified)
function generateQRCodeData(groupId: string, userId: string, ticketIndex: number): string {
  return `GT-${groupId.split('-')[0]}-${userId.split('-')[0]}-${ticketIndex}`;
}

// Update booking status
async function updateBookingStatus(userId: string, groupId: string, status: string) {
  try {
    const userBookingsKey = `user:${userId}:bookings`;
    const bookingsListData = await kv.get(userBookingsKey);
    
    if (!bookingsListData) return;
    
    const bookingIds = JSON.parse(bookingsListData);
    
    for (const bookingId of bookingIds) {
      const bookingData = await kv.get(`booking:${bookingId}`);
      if (bookingData) {
        const booking = JSON.parse(bookingData);
        if (booking.groupId === groupId) {
          booking.status = status;
          booking.ticketsSentAt = new Date().toISOString();
          await kv.set(`booking:${bookingId}`, JSON.stringify(booking));
        }
      }
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}

// Health check
app.get('/make-server-72f8f261/health', (c) => {
  return c.json({ status: 'ok', message: 'GroupTrip API is running' });
});

// User signup
app.post('/make-server-72f8f261/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }

    // Staff email - only this email gets staff role automatically
    const STAFF_EMAIL = 'claudia.wolna@op.pl';
    let userRole = 'user'; // default role
    
    if (email.toLowerCase() === STAFF_EMAIL.toLowerCase()) {
      userRole = 'staff';
      console.log(`👑 Staff account registration: ${email} - granting staff role`);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: userRole
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role
      } 
    });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Upgrade Claudia's account to staff (one-time use)
app.post('/make-server-72f8f261/upgrade-claudia', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in first' }, 401);
    }

    // Only works for claudia.wolna@op.pl
    if (user.email?.toLowerCase() !== 'claudia.wolna@op.pl') {
      return c.json({ error: 'This endpoint is only for Claudia' }, 403);
    }

    console.log(`👑 Upgrading ${user.email} to staff role...`);

    // Update user metadata to include staff role
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'staff'
        }
      }
    );

    if (error) {
      console.log('Error granting staff role:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log(`✅ ${user.email} is now STAFF!`);

    return c.json({ 
      success: true, 
      message: 'Zostałaś pracownikiem! Odśwież stronę.',
      user: { 
        id: data.user.id, 
        email: data.user.email,
        role: 'staff'
      } 
    });
  } catch (error) {
    console.log('Upgrade-claudia exception:', error);
    return c.json({ error: 'Failed to grant staff role' }, 500);
  }
});

// Create a new group
app.post('/make-server-72f8f261/groups', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const { attractionId, attractionName, location, category, date, time, numberOfPeople, currentMembers, ticketHolders, groupPrice, regularPrice, minPeople } = await c.req.json();

    if (!attractionId || !attractionName || !date || !time || !numberOfPeople) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const groupId = crypto.randomUUID();
    // Ensure all numbers are properly parsed
    const initialMembers = parseInt(currentMembers) || 1;
    const minRequired = parseInt(minPeople) || 15;
    let totalSlots = parseInt(numberOfPeople) || 15;
    
    // Elastyczna wielkość - jeśli organizator rezerwuje więcej niż standard, zwiększ grupę
    if (initialMembers > totalSlots) {
      console.log(`📈 Organizer booking ${initialMembers} tickets, expanding group from ${totalSlots} to ${initialMembers}`);
      totalSlots = initialMembers;
    }
    
    console.log(`Creating group: initialMembers=${initialMembers}, capacity=${totalSlots}, minRequired=${minRequired}`);
    
    // Check if group reached minimum from the start
    const isFull = initialMembers >= minRequired;
    
    const group = {
      id: groupId,
      attractionId,
      attractionName,
      location,
      category,
      date,
      time,
      numberOfPeople: totalSlots,
      groupPrice,
      regularPrice,
      minPeople,
      organizerId: user.id,
      organizerName: user.user_metadata.name,
      organizerEmail: user.email,
      currentMembers: initialMembers,
      members: [{
        userId: user.id,
        name: user.user_metadata.name,
        email: user.email,
        numberOfTickets: initialMembers,
        ticketHolders: ticketHolders || [],
        joinedAt: new Date().toISOString(),
        isOrganizer: true
      }],
      status: isFull ? 'full' : 'open',
      createdAt: new Date().toISOString()
    };

    // If group is full immediately, mark for confirmation (not auto-send tickets)
    if (isFull) {
      group.completedAt = new Date().toISOString();
      await markGroupForConfirmation(group);
    }

    await kv.set(`group:${groupId}`, JSON.stringify(group));
    
    // Add to groups list
    const groupsListKey = 'groups:list';
    const existingGroups = await kv.get(groupsListKey);
    const groupsList = existingGroups ? JSON.parse(existingGroups) : [];
    groupsList.push(groupId);
    await kv.set(groupsListKey, JSON.stringify(groupsList));

    return c.json({ success: true, group });
  } catch (error) {
    console.log('Create group error:', error);
    return c.json({ error: 'Failed to create group' }, 500);
  }
});

// Get all available groups
app.get('/make-server-72f8f261/groups', async (c) => {
  try {
    const groupsListKey = 'groups:list';
    const groupsListData = await kv.get(groupsListKey);
    
    if (!groupsListData) {
      return c.json({ groups: [] });
    }

    const groupIds = JSON.parse(groupsListData);
    const groupKeys = groupIds.map((id: string) => `group:${id}`);
    const groupsData = await kv.mget(groupKeys);

    const groups = groupsData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data))
      .filter((group) => group.status === 'open' && group.currentMembers < group.numberOfPeople);

    console.log(`📋 Fetched ${groups.length} open groups:`, groups.map(g => ({
      id: g.id,
      attractionName: g.attractionName,
      currentMembers: g.currentMembers,
      numberOfPeople: g.numberOfPeople,
      status: g.status
    })));

    return c.json({ groups });
  } catch (error) {
    console.log('Get groups error:', error);
    return c.json({ error: 'Failed to fetch groups' }, 500);
  }
});

// Get specific group details
app.get('/make-server-72f8f261/groups/:id', async (c) => {
  try {
    const groupId = c.req.param('id');
    const groupData = await kv.get(`group:${groupId}`);

    if (!groupData) {
      console.log(`❌ Group ${groupId} not found in KV store`);
      return c.json({ error: 'Group not found' }, 404);
    }

    const group = JSON.parse(groupData);
    console.log(`📖 Get group ${groupId}:`, {
      currentMembers: group.currentMembers,
      numberOfPeople: group.numberOfPeople,
      status: group.status,
      membersCount: group.members?.length
    });
    return c.json({ group });
  } catch (error) {
    console.log('Get group details error:', error);
    return c.json({ error: 'Failed to fetch group details' }, 500);
  }
});

// Join a group
app.post('/make-server-72f8f261/groups/:id/join', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const groupId = c.req.param('id');
    const { numberOfTickets, ticketHolders } = await c.req.json();
    
    // Ensure numberOfTickets is a number
    const ticketCount = parseInt(numberOfTickets);

    const groupData = await kv.get(`group:${groupId}`);
    if (!groupData) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const group = JSON.parse(groupData);
    
    // Ensure currentMembers and numberOfPeople are numbers
    group.currentMembers = parseInt(group.currentMembers);
    group.numberOfPeople = parseInt(group.numberOfPeople);
    const minPeople = parseInt(group.minPeople) || 15;

    // Check if user already joined
    const alreadyJoined = group.members.some((m: any) => m.userId === user.id);
    if (alreadyJoined) {
      return c.json({ error: 'You have already joined this group' }, 400);
    }

    // Add member to group
    group.members.push({
      userId: user.id,
      name: user.user_metadata.name,
      email: user.email,
      numberOfTickets: ticketCount,
      ticketHolders,
      joinedAt: new Date().toISOString(),
      isOrganizer: false
    });

    const previousMembers = group.currentMembers;
    group.currentMembers += ticketCount;

    // Elastyczna wielkość grupy - jeśli nowy członek powoduje przekroczenie, zwiększ grupę
    if (group.currentMembers > group.numberOfPeople) {
      console.log(`📈 Expanding group ${groupId} from ${group.numberOfPeople} to ${group.currentMembers} people`);
      group.numberOfPeople = group.currentMembers;
    }

    console.log(`Join group ${groupId}: ${previousMembers} + ${ticketCount} = ${group.currentMembers} (capacity: ${group.numberOfPeople}, min: ${minPeople})`);

    // Update group status if minimum reached (15+ people)
    if (group.currentMembers >= minPeople) {
      group.status = 'full';
      group.completedAt = new Date().toISOString();
      
      console.log(`Group ${groupId} is now FULL (${group.currentMembers}/${group.numberOfPeople})`);
      
      // Mark for confirmation instead of auto-sending tickets
      await markGroupForConfirmation(group);
    }

    await kv.set(`group:${groupId}`, JSON.stringify(group));
    
    console.log(`💾 Group ${groupId} saved to KV store:`, {
      currentMembers: group.currentMembers,
      numberOfPeople: group.numberOfPeople,
      status: group.status,
      membersCount: group.members.length
    });

    return c.json({ success: true, group });
  } catch (error) {
    console.log('Join group error:', error);
    return c.json({ error: 'Failed to join group' }, 500);
  }
});

// Create booking/reservation
app.post('/make-server-72f8f261/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const { groupId, attractionId, attractionName, numberOfTickets, ticketHolders, totalPaid, date, time } = await c.req.json();

    const bookingId = crypto.randomUUID();
    const booking = {
      id: bookingId,
      userId: user.id,
      userName: user.user_metadata.name,
      groupId,
      attractionId,
      attractionName,
      numberOfTickets,
      ticketHolders,
      totalPaid,
      date,
      time,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save booking
    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    // Add to user's bookings list
    const userBookingsKey = `user:${user.id}:bookings`;
    const existingBookings = await kv.get(userBookingsKey);
    const bookingsList = existingBookings ? JSON.parse(existingBookings) : [];
    bookingsList.push(bookingId);
    await kv.set(userBookingsKey, JSON.stringify(bookingsList));

    return c.json({ success: true, booking });
  } catch (error) {
    console.log('Create booking error:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Get user's bookings
app.get('/make-server-72f8f261/user/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const userBookingsKey = `user:${user.id}:bookings`;
    const bookingsListData = await kv.get(userBookingsKey);

    if (!bookingsListData) {
      return c.json({ bookings: [] });
    }

    const bookingIds = JSON.parse(bookingsListData);
    const bookingKeys = bookingIds.map((id: string) => `booking:${id}`);
    const bookingsData = await kv.mget(bookingKeys);

    const bookings = bookingsData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data));

    return c.json({ bookings });
  } catch (error) {
    console.log('Get user bookings error:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Get user's created groups
app.get('/make-server-72f8f261/user/groups', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const groupsListKey = 'groups:list';
    const groupsListData = await kv.get(groupsListKey);

    if (!groupsListData) {
      return c.json({ groups: [] });
    }

    const groupIds = JSON.parse(groupsListData);
    const groupKeys = groupIds.map((id: string) => `group:${id}`);
    const groupsData = await kv.mget(groupKeys);

    const userGroups = groupsData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data))
      .filter((group) => group.organizerId === user.id);

    return c.json({ groups: userGroups });
  } catch (error) {
    console.log('Get user groups error:', error);
    return c.json({ error: 'Failed to fetch user groups' }, 500);
  }
});

// Get all groups where user is a member (including as organizer or participant)
app.get('/make-server-72f8f261/user/groups/all', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const groupsListKey = 'groups:list';
    const groupsListData = await kv.get(groupsListKey);

    if (!groupsListData) {
      return c.json({ groups: [] });
    }

    const groupIds = JSON.parse(groupsListData);
    const groupKeys = groupIds.map((id: string) => `group:${id}`);
    const groupsData = await kv.mget(groupKeys);

    // Get all groups where user is a member (in members array)
    const userGroups = groupsData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data))
      .filter((group) => 
        group.members && 
        group.members.some((m: any) => m.userId === user.id)
      );

    return c.json({ groups: userGroups });
  } catch (error) {
    console.log('Get user member groups error:', error);
    return c.json({ error: 'Failed to fetch user groups' }, 500);
  }
});

// Get tickets for a specific group
app.get('/make-server-72f8f261/tickets/:groupId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const groupId = c.req.param('groupId');
    const ticketsKey = `tickets:${user.id}:${groupId}`;
    const ticketsData = await kv.get(ticketsKey);

    if (!ticketsData) {
      return c.json({ tickets: [] });
    }

    const tickets = JSON.parse(ticketsData);
    return c.json({ tickets });
  } catch (error) {
    console.log('Get tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Get all user's tickets
app.get('/make-server-72f8f261/user/tickets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    // Get all tickets for this user using prefix search
    const ticketsPrefix = `tickets:${user.id}:`;
    const allTicketsData = await kv.getByPrefix(ticketsPrefix);

    const allTickets = allTicketsData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data))
      .flat(); // Flatten array of arrays

    return c.json({ tickets: allTickets });
  } catch (error) {
    console.log('Get all user tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Middleware to check if user is staff
async function requireStaffRole(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

  if (!user || authError) {
    return c.json({ error: 'Unauthorized - please log in' }, 401);
  }

  // Check if user has staff role
  if (user.user_metadata?.role !== 'staff') {
    console.log(`⛔ Access denied: User ${user.email} tried to access staff-only endpoint`);
    return c.json({ error: 'Access denied - staff only' }, 403);
  }

  // User is staff, continue
  await next();
}

// Apply staff middleware to all admin routes
app.use('/make-server-72f8f261/admin/*', requireStaffRole);

// ADMIN ENDPOINT: Delete all groups (for testing/reset)
app.delete('/make-server-72f8f261/admin/groups/all', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    // Staff role already checked by middleware

    // Get all groups using prefix search
    const groupsPrefix = 'group:';
    const allGroupsData = await kv.getByPrefix(groupsPrefix);

    // Extract group IDs
    const groupIds: string[] = [];
    allGroupsData.forEach((data) => {
      if (data) {
        const group = JSON.parse(data);
        groupIds.push(group.id);
      }
    });

    // Delete all group keys
    const groupKeys = groupIds.map(id => `group:${id}`);
    if (groupKeys.length > 0) {
      await kv.mdel(groupKeys);
    }

    // Also delete all bookings - get their IDs from group members
    const bookingIds: string[] = [];
    allGroupsData.forEach((data) => {
      if (data) {
        const group = JSON.parse(data);
        if (group.members && Array.isArray(group.members)) {
          group.members.forEach((member: any) => {
            if (member.bookingId) {
              bookingIds.push(member.bookingId);
            }
          });
        }
      }
    });

    // Delete all booking keys
    const bookingKeys = bookingIds.map(id => `booking:${id}`);
    if (bookingKeys.length > 0) {
      await kv.mdel(bookingKeys);
    }

    console.log(`Deleted ${groupIds.length} groups and ${bookingIds.length} bookings`);

    return c.json({ 
      success: true, 
      message: `Usunięto ${groupIds.length} grup i ${bookingIds.length} rezerwacji`,
      deletedGroups: groupIds.length,
      deletedBookings: bookingIds.length
    });
  } catch (error) {
    console.log('Delete all groups error:', error);
    return c.json({ error: 'Failed to delete groups' }, 500);
  }
});

// ADMIN ENDPOINT: Get all full groups (for staff to review and send tickets)
app.get('/make-server-72f8f261/admin/groups/full', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    // Staff role already checked by middleware

    // Get all groups using prefix search
    const groupsPrefix = 'group:';
    const allGroupsData = await kv.getByPrefix(groupsPrefix);

    const allGroups = allGroupsData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data))
      .filter((group) => group.status === 'full'); // Only full groups

    // Sort by completion date (newest first)
    allGroups.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    return c.json({ groups: allGroups });
  } catch (error) {
    console.log('Get full groups error:', error);
    return c.json({ error: 'Failed to fetch full groups' }, 500);
  }
});

// ADMIN ENDPOINT: Manually confirm and send tickets for a group
// This should be called after confirming availability with the facility
app.post('/make-server-72f8f261/admin/groups/:id/send-tickets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    // Staff role already checked by middleware

    const groupId = c.req.param('id');
    const groupData = await kv.get(`group:${groupId}`);

    if (!groupData) {
      return c.json({ error: 'Group not found' }, 404);
    }

    const group = JSON.parse(groupData);

    // Check if group is full
    if (group.status !== 'full') {
      return c.json({ error: 'Group must be full before sending tickets' }, 400);
    }

    // Send tickets to all members
    await sendTicketsToAllMembers(group);

    // Update group status
    group.ticketsSentAt = new Date().toISOString();
    await kv.set(`group:${groupId}`, JSON.stringify(group));

    return c.json({ 
      success: true, 
      message: `Tickets sent to all ${group.members.length} members of group ${groupId}` 
    });
  } catch (error) {
    console.log('Send tickets error:', error);
    return c.json({ error: 'Failed to send tickets' }, 500);
  }
});

Deno.serve(app.fetch);
