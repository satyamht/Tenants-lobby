export type ListingStatus = "ACTIVE" | "EXPIRING" | "EXPIRED" | "RENTED" | "SUSPENDED";

export type VerificationStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "FLAGGED"
  | "EXPIRED"
  | "REVERIFICATION_REQUIRED";

export interface PropertySearchResult {
  id: string;
  title: string;
  property_type: string;
  room_type: string | null;
  city: string;
  locality: string;
  monthly_rent: number | null;
  daily_rent: number | null;
  weekly_rent: number | null;
  security_deposit: number | null;
  maintenance: number | null;
  listing_status: ListingStatus;
  verification_status: VerificationStatus;
}

export interface ApproximateLocation {
  city: string;
  locality: string;
  distance_km?: number;
  radius_km?: number;
}

export interface LockedLocationState {
  exactLocationAvailable: false;
  reason: "AUTH_REQUIRED" | "ENTITLEMENT_REQUIRED" | "PAYMENT_REQUIRED" | "VERIFICATION_REQUIRED";
}
