-- Add payment_type column to expense_detail table
ALTER TABLE expense_detail 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'mandatory' 
CHECK (payment_type IN ('mandatory', 'optional'));

-- Update existing records to have default payment_type
UPDATE expense_detail 
SET payment_type = 'mandatory' 
WHERE payment_type IS NULL;
