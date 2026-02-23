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

export interface BookingStatusLog {
  id: string;
  booking_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
  note: string | null;
}

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: Artist;
        Insert: Omit<Artist, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Artist, "id" | "created_at" | "updated_at">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at" | "day_of_week">;
        Update: Partial<Omit<Booking, "id" | "created_at" | "updated_at" | "day_of_week">>;
      };
      tours: {
        Row: Tour;
        Insert: Omit<Tour, "id" | "created_at">;
        Update: Partial<Omit<Tour, "id" | "created_at">>;
      };
      booking_status_log: {
        Row: BookingStatusLog;
        Insert: Omit<BookingStatusLog, "id" | "changed_at">;
        Update: Partial<Omit<BookingStatusLog, "id" | "changed_at">>;
      };
    };
  };
}
