import { v4 as uuidv4 } from 'uuid';
import { Item, NewItem, StorageOperationResult } from './types';
import { supabase } from './supabase';

export async function getAllItems(): Promise<Item[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  return data || [];
}

export async function addItem(item: NewItem): Promise<StorageOperationResult> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'You must be logged in to add items' };
    }

    const isLending = item.type === 'lent';
    
    // First try to get the user directly from auth.users
    const { data: otherUserData, error: otherUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', item.borrower_email)
      .single();

    if (otherUserError || !otherUserData) {
      return { 
        success: false, 
        error: 'Borrower email not found. Make sure they have an account and the email is correct.'
      };
    }

    const newItem = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      item_name: item.item_name,
      person: item.person,
      date: item.date,
      type: item.type,
      category: item.category,
      returned: false,
      notes: item.notes,
      reminder_date: item.reminder_date,
      agreement_status: 'pending',
      lender_id: isLending ? user.id : otherUserData.id,
      borrower_id: isLending ? otherUserData.id : user.id,
      borrower_email: item.borrower_email
    };

    const { error: insertError } = await supabase
      .from('items')
      .insert([newItem]);

    if (insertError) {
      console.error('Error adding item:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in addItem:', err);
    return { success: false, error: 'Failed to add item' };
  }
}

export async function updateItemAgreement(
  itemId: string, 
  status: 'accepted' | 'rejected'
): Promise<StorageOperationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to update agreements' };
  }

  const { error } = await supabase
    .from('items')
    .update({ agreement_status: status })
    .eq('id', itemId)
    .eq('borrower_id', user.id);

  if (error) {
    console.error('Error updating agreement:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateItem(id: string, updates: Partial<NewItem>): Promise<StorageOperationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to update items' };
  }

  const { error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`);

  if (error) {
    console.error('Error updating item:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteItem(id: string): Promise<StorageOperationResult> {
  console.log('Deleting item with ID:', id);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, cannot delete');
      return { success: false, error: 'You must be logged in to delete items' };
    }
    console.log('User ID:', user.id);

    // First, check if the item exists and get its status
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      console.error('Error fetching item:', fetchError);
      return { success: false, error: 'Item not found' };
    }

    console.log('Found item:', item);

    // Allow the user to delete the item if they are either the lender or borrower
    if (item.lender_id !== user.id && item.borrower_id !== user.id) {
      console.log('Cannot delete: User is neither lender nor borrower');
      return { success: false, error: 'You can only delete items you are involved with' };
    }

    // Now delete the item
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      return { success: false, error: deleteError.message };
    }

    console.log('Item deleted successfully');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteItem:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getItem(id: string): Promise<Item | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  return data;
} 