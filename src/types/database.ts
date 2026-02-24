export type BookingStatus =
  | "enquiry"
  | "hold"
  | "offered"
  | "pending"
  | "confirmed"
  | "contracted"
  | "advanced"
  | "settled"
  | "cancelled"
  | "declined";

export type DealType =
  | "flat_fee"
  | "door_split"
  | "versus"
  | "plus"
  | "buyout"
  | "custom";

export interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string | null;
  territory: string | null;
  color: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  artist_id: string;
  tour_id: string | null;
  status: BookingStatus;
  status_locked: boolean;
  date: string;
  day_of_week: string | null;
  country: string | null;
  city: string | null;
  venue_name: string | null;
  venue_capacity: number | null;
  room: string | null;
  room_capacity: number | null;
  currency: string | null;
  fee: number | null;
  deal_type: DealType | null;
  deal_percentage: number | null;
  deal_versus: boolean;
  expenses: number | null;
  buyout: number | null;
  add_ons: string | null;
  billing: string | null;
  set_length: number | null;
  set_time: string | null;
  promoter_name: string | null;
  promoter_email: string | null;
  promoter_company: string | null;
  previous_artists: string | null;
  artists_booked: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  name: string;
  artist_id: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

export type DealMemoLinkStatus = "sent" | "viewed" | "submitted" | "expired";

export interface DealMemoLink {
  id: string;
  booking_id: string;
  token: string;
  status: DealMemoLinkStatus;
  submitted_data: Record<string, unknown> | null;
  created_at: string;
  expires_at: string | null;
}

export interface BookingStatusLog {
  id: string;
  booking_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
  note: string | null;
}

type RowType<T> = T & Record<string, unknown>;
type InsertType<T> = T & Record<string, unknown>;
type UpdateType<T> = T & Record<string, unknown>;

/** Extract keys whose value type includes null */
type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

/** Make nullable fields optional for inserts */
type InsertShape<T, Omitted extends keyof T> = InsertType<
  Required<Pick<T, Exclude<keyof T, Omitted | NullableKeys<T>>>> &
  Partial<Pick<T, NullableKeys<T> & Exclude<keyof T, Omitted>>>
>;

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: RowType<Artist>;
        Insert: InsertShape<Artist, "id" | "created_at" | "updated_at">;
        Update: UpdateType<Partial<Omit<Artist, "id" | "created_at" | "updated_at">>>;
        Relationships: [];
      };
      bookings: {
        Row: RowType<Booking>;
        Insert: InsertShape<Booking, "id" | "created_at" | "updated_at" | "day_of_week">;
        Update: UpdateType<Partial<Omit<Booking, "id" | "created_at" | "updated_at" | "day_of_week">>>;
        Relationships: [];
      };
      tours: {
        Row: RowType<Tour>;
        Insert: InsertType<Omit<Tour, "id" | "created_at">>;
        Update: UpdateType<Partial<Omit<Tour, "id" | "created_at">>>;
        Relationships: [];
      };
      booking_status_log: {
        Row: RowType<BookingStatusLog>;
        Insert: InsertType<Omit<BookingStatusLog, "id" | "changed_at">>;
        Update: UpdateType<Partial<Omit<BookingStatusLog, "id" | "changed_at">>>;
        Relationships: [];
      };
      deal_memo_links: {
        Row: RowType<DealMemoLink>;
        Insert: InsertType<Omit<DealMemoLink, "id" | "created_at">>;
        Update: UpdateType<Partial<Omit<DealMemoLink, "id" | "created_at">>>;
        Relationships: [];
      };
    };
    Views: Record<string, { Row: Record<string, unknown>; Relationships: never[] }>;
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
  };
}
