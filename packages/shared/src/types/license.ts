/**
 * License management types
 */

export interface License {
  key: string;
  email?: string;
  activatedAt: Date;
  verified: boolean;
  productId: string;
}

export interface GumroadVerifyResponse {
  success: boolean;
  uses: number;
  purchase: {
    seller_id: string;
    product_id: string;
    product_name: string;
    permalink: string;
    product_permalink: string;
    email: string;
    price: number;
    gumroad_fee: number;
    currency: string;
    quantity: number;
    discover_fee_charged: boolean;
    can_contact: boolean;
    referrer: string;
    card: {
      visual: string | null;
      type: string | null;
      bin: string | null;
      expiry_month: string | null;
      expiry_year: string | null;
    };
    order_number: number;
    sale_id: string;
    sale_timestamp: string;
    purchaser_id: string;
    subscription_id: string | null;
    variants: string;
    license_key: string;
    is_multiseat_license: boolean;
    ip_country: string;
    recurrence: string;
    is_gift_receiver_purchase: boolean;
    refunded: boolean;
    disputed: boolean;
    dispute_won: boolean;
    id: string;
    created_at: string;
    custom_fields: Record<string, string>;
    chargebacked: boolean;
    subscription_ended_at: string | null;
    subscription_cancelled_at: string | null;
    subscription_failed_at: string | null;
  };
}
