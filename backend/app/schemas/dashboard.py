from decimal import Decimal

from pydantic import BaseModel


class DashboardStats(BaseModel):
    open_job_cards: int
    jobs_in_progress: int
    revenue_this_month: Decimal
    unpaid_invoices: int
    outstanding_balance: Decimal
    low_stock_parts: int
    upcoming_appointments: int
    total_customers: int
    total_vehicles: int
