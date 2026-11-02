-- Gym Management System — sample data
-- 10 gym members with membership (duration), fee, and attendance records.

INSERT INTO membership_plans (name, duration_months, price) VALUES
    ('Basic', 1, 29.00),
    ('Standard', 3, 49.00),
    ('Premium', 6, 79.00),
    ('Elite', 12, 99.00)
ON DUPLICATE KEY UPDATE duration_months = VALUES(duration_months), price = VALUES(price);

INSERT INTO members (full_name, email, phone, join_date, status) VALUES
    ('John Smith',      'john@example.com',     '(555) 123-4567', '2023-01-15', 'Active'),
    ('Sarah Johnson',   'sarah@example.com',     '(555) 234-5678', '2023-02-10', 'Active'),
    ('Michael Brown',   'michael@example.com',   '(555) 345-6789', '2023-03-05', 'Inactive'),
    ('Emily Davis',     'emily@example.com',     '(555) 456-7890', '2023-04-20', 'Active'),
    ('David Wilson',    'david@example.com',     '(555) 567-8901', '2023-05-12', 'Active'),
    ('Lisa Anderson',   'lisa@example.com',      '(555) 678-9012', '2023-06-18', 'Active'),
    ('Robert Taylor',   'robert@example.com',    '(555) 789-0123', '2023-07-22', 'Inactive'),
    ('Jennifer Lee',    'jennifer@example.com',  '(555) 890-1234', '2023-08-30', 'Active'),
    ('Mark Thompson',   'mark@example.com',      '(555) 901-2345', '2023-09-10', 'Active'),
    ('Olivia Garcia',   'olivia@example.com',    '(555) 012-3456', '2023-10-02', 'Active');

-- Membership duration: one active plan assignment per member (plan_id matches membership_plans insert order).
INSERT INTO memberships (member_id, plan_id, start_date, end_date, status) VALUES
    (1, 3, '2023-01-15', DATE_ADD('2023-01-15', INTERVAL 6 MONTH),  'Expired'),
    (2, 4, '2023-02-10', DATE_ADD('2023-02-10', INTERVAL 12 MONTH), 'Active'),
    (3, 2, '2023-03-05', DATE_ADD('2023-03-05', INTERVAL 3 MONTH),  'Expired'),
    (4, 1, '2023-04-20', DATE_ADD('2023-04-20', INTERVAL 1 MONTH),  'Expired'),
    (5, 3, '2023-05-12', DATE_ADD('2023-05-12', INTERVAL 6 MONTH),  'Expired'),
    (6, 4, '2023-06-18', DATE_ADD('2023-06-18', INTERVAL 12 MONTH), 'Active'),
    (7, 2, '2023-07-22', DATE_ADD('2023-07-22', INTERVAL 3 MONTH),  'Expired'),
    (8, 3, '2023-08-30', DATE_ADD('2023-08-30', INTERVAL 6 MONTH),  'Active'),
    (9, 1, '2023-09-10', DATE_ADD('2023-09-10', INTERVAL 1 MONTH),  'Expired'),
    (10, 2, '2023-10-02', DATE_ADD('2023-10-02', INTERVAL 3 MONTH), 'Active');

-- Fees: one payment record per member, mirroring the memberships above.
INSERT INTO fees (member_id, membership_id, amount, due_date, paid_date, status) VALUES
    (1,  1,  79.00, '2023-10-05', '2023-10-04', 'Paid'),
    (2,  2,  99.00, '2023-10-10', NULL,         'Pending'),
    (3,  3,  49.00, '2023-10-01', NULL,         'Overdue'),
    (4,  4,  29.00, '2023-10-15', '2023-10-14', 'Paid'),
    (5,  5,  79.00, '2023-10-12', NULL,         'Pending'),
    (6,  6,  99.00, '2023-10-08', '2023-10-07', 'Paid'),
    (7,  7,  49.00, '2023-09-28', NULL,         'Overdue'),
    (8,  8,  79.00, '2023-10-20', NULL,         'Pending'),
    (9,  9,  29.00, '2023-10-18', '2023-10-17', 'Paid'),
    (10, 10, 49.00, '2023-10-22', NULL,         'Pending');

-- Attendance: a few check-ins per active member.
INSERT INTO attendance (member_id, check_in_date, check_in_time, check_out_time) VALUES
    (1, '2023-10-01', '06:15:00', '07:10:00'),
    (1, '2023-10-03', '06:20:00', '07:05:00'),
    (2, '2023-10-01', '08:00:00', '09:00:00'),
    (2, '2023-10-02', '08:05:00', '09:10:00'),
    (4, '2023-10-02', '17:30:00', '18:30:00'),
    (5, '2023-10-01', '06:00:00', '07:00:00'),
    (6, '2023-10-03', '18:00:00', '19:00:00'),
    (8, '2023-10-02', '07:00:00', '08:00:00'),
    (9, '2023-10-01', '06:30:00', NULL),
    (10, '2023-10-03', '09:00:00', '10:00:00');
