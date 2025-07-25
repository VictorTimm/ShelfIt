
-- Add agreement status to items table
ALTER TABLE items 
ADD COLUMN agreement_status TEXT DEFAULT 'pending' CHECK (agreement_status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN lender_id UUID REFERENCES auth.users(id),
ADD COLUMN borrower_id UUID REFERENCES auth.users(id),
ADD COLUMN borrower_email TEXT;

-- Update RLS policies
DROP POLICY IF EXISTS \
Users
can
read
their
own
items\ ON items;
DROP POLICY IF EXISTS \Users
can
insert
their
own
items\ ON items;
DROP POLICY IF EXISTS \Users
can
update
their
own
items\ ON items;
DROP POLICY IF EXISTS \Users
can
delete
their
own
items\ ON items;

-- New policies that allow both lender and borrower to access items
CREATE POLICY \Users
can
read
items
they
are
involved
in\ ON items
    FOR SELECT USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

CREATE POLICY \Users
can
insert
items
as
lender\ ON items
    FOR INSERT WITH CHECK (auth.uid() = lender_id);

CREATE POLICY \Users
can
update
their
involved
items\ ON items
    FOR UPDATE USING (auth.uid() IN (lender_id, borrower_id));

CREATE POLICY \Lender
can
delete
pending
items\ ON items
    FOR DELETE USING (auth.uid() = lender_id AND agreement_status = 'pending');

