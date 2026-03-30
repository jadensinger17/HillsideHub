-- 015: Populate deliberation results from "Deliberation Acceptance.csv"
-- Updates info_sessions, decision, status, and deliberation_started_at for all applicants
-- Decision mapping: yes→interview, no/no_class→rejected, maybe→deliberation
-- Self-contained: drops and recreates the status CHECK constraint to include 'deliberation'

-- Step 1: Drop any existing status check constraint (handles both named and auto-named variants)
DO $$
DECLARE
  con_name TEXT;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.applicants'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.applicants DROP CONSTRAINT %I', con_name);
  END IF;
END;
$$;

-- Step 2: Re-add the constraint with 'deliberation' included
ALTER TABLE public.applicants
  ADD CONSTRAINT applicants_status_check
    CHECK (status IN ('pending', 'interview', 'deliberation', 'accepted', 'rejected'));

-- Step 3: Add deliberation_started_at if not already present
ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS deliberation_started_at TIMESTAMPTZ;

WITH deliberation_data (applicant_name, info_sessions, decision) AS (
  VALUES
    ('Aaron Rouse',                   1, 'no'),
    ('Aaryan Gupta',                  2, 'yes'),
    ('Adithya Nataraj',               1, 'yes'),
    ('Aditya Nair',                   0, 'no'),
    ('Adrian Nottelmann',             0, 'no'),
    ('Ahmed Osman',                   4, 'yes'),
    ('Albi Bylyku',                   1, 'maybe'),
    ('Alexander Greenberg',           0, 'no_class'),
    ('Almari Castillo',               0, 'yes'),
    ('Amir Alston',                   0, 'no'),
    ('Andrew Vaill',                  0, 'no'),
    ('Andre LaRochelle',              4, 'yes'),
    ('Arianna Kedersha',              1, 'no_class'),
    ('Arfa Begum',                    0, 'yes'),
    ('Arya Patel',                    2, 'yes'),
    ('Benjamin Anderson',             1, 'yes'),
    ('Bhayesha Raj Chugh',            0, 'no'),
    ('Brandon Chan',                  0, 'yes'),
    ('Brenden Boyer',                 0, 'no'),
    ('Caleb Awuah',                   4, 'yes'),
    ('Caroline Bernacki',             0, 'maybe'),
    ('Chloe Morales',                 0, 'yes'),
    ('Clive Leung',                   1, 'yes'),
    ('Cole Ostrosky',                 1, 'yes'),
    ('Colin McGann',                  0, 'yes'),
    ('Collin Murray',                 2, 'yes'),
    ('Cristian Jimenez',              3, 'yes'),
    ('Dev Gorasiya',                  1, 'yes'),
    ('Egor Vasilyev',                 0, 'yes'),
    ('Ethan Masoperh',                0, 'no'),
    ('Evan Espino',                   0, 'no'),
    ('Evan Michael Morrow',           0, 'maybe'),
    ('Faryal Akbar',                  2, 'yes'),
    ('Filip Ciganik',                 0, 'no'),
    ('Giacomo Vinces',                0, 'no'),
    ('Grejs Shelcaj',                 0, 'yes'),
    ('Hannah Krause',                 0, 'no'),
    ('Hannah Patz',                   0, 'no'),
    ('Hyeongyu (David) Kang',         0, 'yes'),
    ('Ikechukwu Ugwa',                3, 'yes'),
    ('Israela Anane',                 3, 'no_class'),
    ('Jackson Cafarella',             1, 'no_class'),
    ('Jaime Lugo',                    0, 'no'),
    ('Jaden King',                    2, 'yes'),
    ('Jake Miller',                   1, 'maybe'),
    ('Jeffrey Ortiz',                 1, 'no'),
    ('Jessica Ndjomou',               2, 'no_class'),
    ('Jiaying Lyu',                   0, 'no'),
    ('Jocelyn Pumayugra',             0, 'no'),
    ('Julia Tkachuk-Kyrychenko',      1, 'no'),
    ('Justin A. Gomes',               1, 'maybe'),
    ('Kaelyn Horn',                   0, 'yes'),
    ('Kaia Wotzak',                   2, 'yes'),
    ('Kayla Le',                      1, 'no'),
    ('Kiril Kovalenko',               0, 'yes'),
    ('Kishan Desai',                  3, 'yes'),
    ('Kuba Gaska',                    0, 'no'),
    ('Kunal Ramchandani',             0, 'maybe'),
    ('Lily Bartone',                  2, 'no_class'),
    ('Luka Vidacak',                  2, 'no'),
    ('Lucas Sosnow',                  0, 'yes'),
    ('Malachi Evans',                 0, 'no'),
    ('Malin Kimani Gitau',            0, 'no'),
    ('Massimo Costa',                 0, 'no'),
    ('Matteo Festa',                  1, 'no'),
    ('Matthew Spector',               0, 'maybe'),
    ('Michael Del Sesto',             3, 'yes'),
    ('Mohammed Nur',                  0, 'no'),
    ('Natalie Ross',                  0, 'no'),
    ('Nestor Castillo Jr.',           0, 'no_class'),
    ('Nicholas Battaglia',            0, 'no'),
    ('Nick Taipe',                    0, 'no_class'),
    ('Nikita Panwar',                 1, 'yes'),
    ('Nicolas Sconziano',             0, 'no'),
    ('Nnadozie Okasi',                0, 'no'),
    ('Nya Cohen',                     2, 'no_class'),
    ('Oliver Kaplan',                 2, 'yes'),
    ('Omar Omar',                     3, 'no'),
    ('Patryk Zielinski',              0, 'no'),
    ('Pristine Ruhuma',               0, 'no_class'),
    ('Rahul Perumal',                 0, 'no_class'),
    ('Ranganathan Kidambi',           2, 'yes'),
    ('Rayden Jones-Miller',           1, 'no'),
    ('Ria Verma',                     0, 'yes'),
    ('Rige Grajcevci',                0, 'no'),
    ('Riley Ramirez',                 0, 'maybe'),
    ('Roan Fothergill',               1, 'no_class'),
    ('Sahil Sheik',                   2, 'maybe'),
    ('Sara Shawahna',                 0, 'yes'),
    ('Sebastian Ramos',               3, 'yes'),
    ('Sebastian Wroblewski',          2, 'yes'),
    ('Shubham Chandra',               1, 'no_class'),
    ('Stephen Sentementes',           4, 'maybe'),
    ('Theodore Mitchell',             3, 'yes'),
    ('Thomson Tran',                  1, 'no_class'),
    ('Tristan Gorman',                0, 'no_class'),
    ('Vedika Patel',                  0, 'no'),
    ('Vincent Ly',                    2, 'no'),
    ('Will Curry',                    0, 'yes'),
    ('Zachary Harrison',              0, 'yes'),
    ('Zion Joseph',                   3, 'no'),
    ('Christian Kim',                 0, 'yes'),
    ('Sean McGowan',                  0, 'no'),
    ('Antonio Juan Umali',            0, 'yes'),
    ('Kaid Algozy',                   0, 'no'),
    ('Liam Naughton',                 0, 'yes')
)
UPDATE applicants a
SET
  info_sessions            = d.info_sessions::integer,
  decision                 = d.decision::text,
  status                   = CASE d.decision
                               WHEN 'yes'      THEN 'interview'
                               WHEN 'no'       THEN 'rejected'
                               WHEN 'no_class' THEN 'rejected'
                               WHEN 'maybe'    THEN 'deliberation'
                             END,
  deliberation_started_at  = NOW(),
  updated_at               = NOW()
FROM deliberation_data d
WHERE TRIM(LOWER(a.name)) = TRIM(LOWER(d.applicant_name));
