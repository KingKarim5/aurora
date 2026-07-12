"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Invoice } from "@/lib/types";
import {
  Badge, btnCls, Empty, ErrorNote, inputCls, Loading, PageHeader, TableShell, Td, Th,
} from "@/components/ui";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const load = useCallback(() => {
    api<Invoice[]>("/invoices").then(setInvoices).catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function recordPayment(e: FormEvent, invoiceId: number) {
    e.preventDefault();
    setError(null);
    try {
      await api(`/invoices/${invoiceId}/payments`, {
        method: "POST",
        body: JSON.stringify({ amount, method }),
      });
      setPayingId(null);
      setAmount("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  return (
    <div>
      <PageHeader title="Invoices" />
      {error && <ErrorNote message={error} />}

      {!invoices ? (
        <Loading />
      ) : invoices.length === 0 ? (
        <Empty message="No invoices yet. Complete a job card and generate one." />
      ) : (
        <TableShell>
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Number</Th><Th>Status</Th><Th>Subtotal</Th><Th>Tax</Th>
              <Th>Total</Th><Th>Balance due</Th><Th>Issued</Th><Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.04]">
                <Td>{inv.number}</Td>
                <Td><Badge value={inv.status} /></Td>
                <Td>${inv.subtotal}</Td>
                <Td>${inv.tax_amount}</Td>
                <Td>${inv.total}</Td>
                <Td>${inv.balance_due}</Td>
                <Td>{new Date(inv.issued_at).toLocaleDateString()}</Td>
                <Td>
                  {["unpaid", "partially_paid"].includes(inv.status) && (
                    payingId === inv.id ? (
                      <form onSubmit={(e) => recordPayment(e, inv.id)} className="flex gap-2">
                        <input
                          className={`${inputCls} w-24`} placeholder="Amount" required
                          value={amount} onChange={(e) => setAmount(e.target.value)}
                        />
                        <select className={inputCls} value={method}
                          onChange={(e) => setMethod(e.target.value)}>
                          {["cash", "card", "bank_transfer", "mobile"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <button type="submit" className={btnCls}>Pay</button>
                      </form>
                    ) : (
                      <button
                        onClick={() => { setPayingId(inv.id); setAmount(inv.balance_due); }}
                        className="font-medium text-sky-300 hover:underline"
                      >
                        Record payment
                      </button>
                    )
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
