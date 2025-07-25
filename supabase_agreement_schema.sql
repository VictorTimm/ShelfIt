-- SQL to run in Supabase SQL Editor

-- First, add the new columns to the items table
ALTER TABLE items
ADD COLUMN counterparty_email TEXT,
ADD COLUMN counterparty_id UUID,
ADD COLUMN agreement_status TEXT DEFAULT 'accepted',
ADD COLUMN agreement_date TIMESTAMPTZ;

-- Create a users view to make it easier to look up users by email
CREATE OR REPLACE VIEW users AS
SELECT id, email
FROM auth.users;

-- Update RLS policies to allow counterparties to view and update items
DROP POLICY IF EXISTS \
Users
can
read
their
own
items\ ON items;
CREATE POLICY \Users
can
read
their
own
items\ ON items
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = counterparty_id);

DROP POLICY IF EXISTS \Users
can
update
their
own
items\ ON items;
CREATE POLICY \Users
can
update
their
own
items\ ON items
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = counterparty_id);

-- Make sure only the creator can delete items (not changing this policy)

