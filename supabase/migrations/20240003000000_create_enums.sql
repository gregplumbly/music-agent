-- Migration: Create enum types for booking_status and deal_type
-- These types are referenced by the bookings table migration

CREATE TYPE booking_status AS ENUM (
  'enquiry',
  'hold',
  'offered',
  'pending',
  'confirmed',
  'contracted',
  'advanced',
  'settled',
  'cancelled',
  'declined'
);

CREATE TYPE deal_type AS ENUM (
  'flat_fee',
  'door_split',
  'versus',
  'plus',
  'buyout',
  'custom'
);
