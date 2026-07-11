export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "mechanic";
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export interface Vehicle {
  id: number;
  customer_id: number;
  vin: string | null;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  mileage_km: number;
}

export interface ComponentTwin {
  component: string;
  score: number;
  status: "good" | "attention" | "critical";
  prediction: string | null;
}

export interface DigitalTwin {
  vehicle_id: number;
  overall_health: number | null;
  status: string;
  components: ComponentTwin[];
  snapshot_count: number;
  last_updated: string | null;
}

export interface JobCardItem {
  id: number;
  item_type: "labor" | "part";
  part_id: number | null;
  description: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface JobCard {
  id: number;
  number: string;
  customer_id: number;
  vehicle_id: number;
  assigned_mechanic_id: number | null;
  status: string;
  complaint: string;
  diagnosis: string | null;
  odometer_km: number;
  created_at: string;
  completed_at: string | null;
  items: JobCardItem[];
  total: string;
}

export interface Part {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit_price: string;
  reorder_level: number;
  supplier: string | null;
}

export interface Payment {
  id: number;
  amount: string;
  method: string;
  paid_at: string;
}

export interface Invoice {
  id: number;
  number: string;
  job_card_id: number;
  customer_id: number;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  status: string;
  issued_at: string;
  payments: Payment[];
  amount_paid: string;
  balance_due: string;
}

export interface DiagnosticFinding {
  code: string;
  known: boolean;
  title: string | null;
  system: string | null;
  severity: number | null;
  likely_causes: string[];
  recommended_actions: string[];
  seen_before_on_same_model: number;
  confidence: number;
}

export interface DiagnosticReport {
  session_id: number;
  vehicle_id: number;
  created_at: string;
  overall_severity: number;
  summary: string;
  findings: DiagnosticFinding[];
}

export interface DashboardStats {
  open_job_cards: number;
  jobs_in_progress: number;
  revenue_this_month: string;
  unpaid_invoices: number;
  outstanding_balance: string;
  low_stock_parts: number;
  upcoming_appointments: number;
  total_customers: number;
  total_vehicles: number;
}
