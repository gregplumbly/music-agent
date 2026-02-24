import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BookingStatusLog } from '../../types/database';

const MIGRATION_PATH = join(
  import.meta.dirname,
  '../../..',
  'supabase/migrations/20240005000000_create_booking_status_log.sql'
);

const sql = readFileSync(MIGRATION_PATH, 'utf-8');

describe('BookingStatusLog type', () => {
  it('has an id property of type string', () => {
    const log = { id: 'uuid-here' } as Partial<BookingStatusLog>;
    expect(typeof log.id).toBe('string');
  });

  it('has a booking_id property of type string', () => {
    const log = { booking_id: 'booking-uuid' } as Partial<BookingStatusLog>;
    expect(typeof log.booking_id).toBe('string');
  });

  it('allows from_status to be null', () => {
    const log: Partial<BookingStatusLog> = { from_status: null };
    expect(log.from_status).toBeNull();
  });

  it('allows from_status to be a string', () => {
    const log: Partial<BookingStatusLog> = { from_status: 'enquiry' };
    expect(log.from_status).toBe('enquiry');
  });

  it('has a to_status property of type string', () => {
    const log: Partial<BookingStatusLog> = { to_status: 'confirmed' };
    expect(typeof log.to_status).toBe('string');
  });

  it('has a changed_at property of type string', () => {
    const log: Partial<BookingStatusLog> = { changed_at: new Date().toISOString() };
    expect(typeof log.changed_at).toBe('string');
  });

  it('allows note to be null', () => {
    const log: Partial<BookingStatusLog> = { note: null };
    expect(log.note).toBeNull();
  });

  it('allows note to be a string', () => {
    const log: Partial<BookingStatusLog> = { note: 'Status changed by admin' };
    expect(log.note).toBe('Status changed by admin');
  });

  it('satisfies the full BookingStatusLog shape', () => {
    const log = {
      id: 'abc123',
      booking_id: 'booking-1',
      from_status: null,
      to_status: 'confirmed',
      changed_at: '2024-01-01T00:00:00Z',
      note: null,
    } satisfies BookingStatusLog;
    expect(log.id).toBe('abc123');
    expect(log.to_status).toBe('confirmed');
  });
});

describe('booking_status_log migration SQL', () => {
  it('creates the booking_status_log table', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS booking_status_log');
  });

  it('has FK to bookings(id) ON DELETE CASCADE', () => {
    expect(sql).toContain('REFERENCES bookings(id) ON DELETE CASCADE');
  });

  it('from_status column is nullable (no NOT NULL)', () => {
    // Ensure from_status exists but without NOT NULL
    expect(sql).toContain('from_status');
    // The line defining from_status should not have NOT NULL
    const fromStatusLine = sql
      .split('\n')
      .find((line) => line.trim().startsWith('from_status'));
    expect(fromStatusLine).toBeDefined();
    expect(fromStatusLine).not.toContain('NOT NULL');
  });

  it('to_status column is NOT NULL', () => {
    const toStatusLine = sql
      .split('\n')
      .find((line) => line.trim().startsWith('to_status'));
    expect(toStatusLine).toBeDefined();
    expect(toStatusLine).toContain('NOT NULL');
  });

  it('has an index on booking_id', () => {
    expect(sql).toContain('booking_status_log_booking_id_idx');
  });

  it('has an index on changed_at', () => {
    expect(sql).toContain('booking_status_log_changed_at_idx');
  });

  it('enables RLS', () => {
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
  });

  it('has an open allow_all policy', () => {
    expect(sql).toContain("CREATE POLICY allow_all ON booking_status_log");
    expect(sql).toContain('USING (true)');
    expect(sql).toContain('WITH CHECK (true)');
  });
});
