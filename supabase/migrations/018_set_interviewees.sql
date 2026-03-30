-- 018: Set interview status + correct emails for all confirmed interviewees
-- Also inserts new applicants not yet in the system and creates rubric records

-- Step 1: Update email + status for all existing applicants in the interview list
WITH interviewee_data (full_name, email) AS (
  VALUES
    ('Ikechukwu Ugwa',               'akd24005@uconn.edu'),
    ('Sebastian Wroblewski',         'sebastian.wroblewski@uconn.edu'),
    ('Evan Michael Morrow',          'evan.morrow@uconn.edu'),
    ('Hyeongyu (David) Kang',        'hyeongyu.kang@uconn.edu'),
    ('Kishan Desai',                 'kishan.desai@uconn.edu'),
    ('Caleb Awuah',                  'ypv24005@uconn.edu'),
    ('Antonio Juan Umali',           'drv25001@uconn.edu'),
    ('Liam Naughton',                'seh25002@uconn.edu'),
    ('Brandon Chan',                 'brc23028@uconn.edu'),
    ('Ahmed Osman',                  'qov24003@uconn.edu'),
    ('Colin McGann',                 'colin.mcgann@uconn.edu'),
    ('Clive Leung',                  'cll23012@uconn.edu'),
    ('Chloe Morales',                'csm23009@uconn.edu'),
    ('Adithya Nataraj',              'adithya.nataraj@uconn.edu'),
    ('Dev Gorasiya',                 'dhg23007@uconn.edu'),
    ('Benjamin Anderson',            'benjamin.3.anderson@uconn.edu'),
    ('Zachary Harrison',             'otm24004@uconn.edu'),
    ('Andre LaRochelle',             'uyf24003@uconn.edu'),
    ('Collin Murray',                'collin.murray@uconn.edu'),
    ('Michael Del Sesto',            'michael.del_sesto@uconn.edu'),
    ('Jaden King',                   'jaden.king@uconn.edu'),
    ('Oliver Kaplan',                'fel24002@uconn.edu'),
    ('Cole Ostrosky',                'cole.ostrosky@uconn.edu'),
    ('Will Curry',                   'william.j.curry@uconn.edu'),
    ('Sara Shawahna',                'sara.shawahna@uconn.edu'),
    ('Ranganathan Kidambi',          'rak23008@uconn.edu'),
    ('Theodore Mitchell',            'theodore.mitchell@uconn.edu'),
    ('Arfa Begum',                   'arfa.begum@uconn.edu'),
    ('Cristian Jimenez',             'uis25002@uconn.edu'),
    ('Ria Verma',                    'ria.verma@uconn.edu'),
    ('Aaron Rouse',                  'atr23012@uconn.edu'),
    ('Almari Castillo',              'almari.castillo@uconn.edu'),
    ('Kaia Wotzak',                  'kgw23009@uconn.edu'),
    ('Egor Vasilyev',                'egor.vasilyev@uconn.edu'),
    ('Grejs Shelcaj',                'gns23005@uconn.edu'),
    ('Kiril Kovalenko',              'vfg24006@uconn.edu'),
    ('Caroline Bernacki',            'caroline.bernacki@uconn.edu'),
    ('Arya Patel',                   'arya.k.patel@uconn.edu'),
    ('Kaelyn Horn',                  'kaelyn.horn@uconn.edu'),
    ('Nikita Panwar',                'fgo24006@uconn.edu'),
    ('Faryal Akbar',                 'faryal.akbar@uconn.edu'),
    ('Sebastian Ramos',              'dan24003@uconn.edu'),
    ('Lucas Sosnow',                 'lrs23014@uconn.edu'),
    ('Matthew Spector',              'mls23019@uconn.edu'),
    ('Albi Bylyku',                  'albi.bylyku@uconn.edu'),
    ('Justin A. Gomes',              'dsf24001@uconn.edu'),
    ('Julia Tkachuk-Kyrychenko',     'julia.tkachuk-kyrychenko@uconn.edu'),
    ('Sahil Sheik',                  'sahil.sheik@uconn.edu'),
    ('Christian Kim',                'csk23001@uconn.edu')
)
UPDATE applicants a
SET
  email      = d.email,
  status     = 'interview',
  updated_at = NOW()
FROM interviewee_data d
WHERE TRIM(LOWER(a.name)) = TRIM(LOWER(d.full_name));

-- Step 2: Insert new applicants not already in the system
INSERT INTO applicants (name, email, status, gpa, submitted_at, updated_at)
VALUES
  ('Julie Orenstein', 'vlk24001@uconn.edu', 'interview', 0.00, NOW(), NOW()),
  ('Jack Parkins',    'jcp23006@uconn.edu', 'interview', 0.00, NOW(), NOW())
ON CONFLICT (email) DO UPDATE
  SET status = 'interview', updated_at = NOW();

-- Step 3: Create rubric records for all interview candidates (skip if already exists)
INSERT INTO interview_rubrics (applicant_id, template, responses, notes, is_complete)
SELECT id, '{}', '{}', '{}', false
FROM applicants
WHERE status = 'interview'
ON CONFLICT (applicant_id) DO NOTHING;
