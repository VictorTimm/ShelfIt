export type ItemCategory = 'Money' | 'Book' | 'Clothing' | 'Device' | 'Tool' | 'Other';
export type AgreementStatus = 'pending' | 'accepted' | 'rejected';

export interface Item {
  id: string;
  created_at?: string;
  item_name: string;
  person: string;
  date: string;
  type: 'borrowed' | 'lent';
  category: ItemCategory;
  returned: boolean;
  notes?: string;
  reminder_date?: string;
  user_id?: string;
  agreement_status: AgreementStatus;
  lender_id?: string;
  borrower_id?: string;
  borrower_email?: string;
}

export type NewItem = Omit<Item, 'id' | 'created_at' | 'user_id' | 'lender_id' | 'borrower_id'>;

export interface StorageOperationResult {
  success: boolean;
  error?: string;
} 