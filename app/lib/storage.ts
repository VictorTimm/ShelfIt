import { v4 as uuidv4 } from 'uuid';
import { Item, NewItem, StorageOperationResult } from './types';
import { supabase } from './supabase';

export async function getAllItems(): Promise<Item[]> {
  console.log('Getting all items...');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No user found, returning empty array');
    return [];
  }

  console.log('Fetching items for user:', user.id);
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  console.log('Found items:', data);
  return data || [];
}

export async function addItem(item: NewItem): Promise<StorageOperationResult> {
  try {
    console.log('Adding item:', item);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return { success: false, error: 'Failed to get user information' };
    }

    if (!user) {
      console.error('No user found');
      return { success: false, error: 'You must be logged in to add items' };
    }

    console.log('Creating new item for user:', user.id);
    const newItem: Item = {
      ...item,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      user_id: user.id
    };

    console.log('Inserting item into Supabase:', newItem);
    const { error } = await supabase
      .from('items')
      .insert([newItem]);

    if (error) {
      console.error('Error adding item:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully added item');
    return { success: true };
  } catch (err) {
    console.error('Error in addItem:', err);
    return { success: false, error: 'Failed to add item' };
  }
}

export async function updateItem(id: string, updates: Partial<NewItem>): Promise<StorageOperationResult> {
  console.log('Updating item:', { id, updates });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return { success: false, error: 'You must be logged in to update items' };
  }

  console.log('Updating item for user:', user.id);
  const { error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating item:', error);
    return { success: false, error: error.message };
  }

  console.log('Successfully updated item');
  return { success: true };
}

export async function deleteItem(id: string): Promise<StorageOperationResult> {
  console.log('Deleting item:', id);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return { success: false, error: 'You must be logged in to delete items' };
  }

  console.log('Deleting item for user:', user.id);
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: error.message };
  }

  console.log('Successfully deleted item');
  return { success: true };
}

export async function getItem(id: string): Promise<Item | null> {
  console.log('Getting item:', id);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return null;
  }

  console.log('Getting item for user:', user.id);
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  console.log('Found item:', data);
  return data;
} 