import InvoiceView from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoices } from "@/hooks/useQueries";
import type { Invoice } from "@/lib/storage";
import { AlertCircle, Info, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function BillCheckPage() {
  const [billNo, setBillNo] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: invoices = [] } = useInvoices();

  useEffect(() => {
    document.title = "Check Bill - ID&PC Chak";
  }, []);

  // BUG-007 FIX: Search by invoice number alone — customers don't know their userId
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const bid = billNo.trim().toLowerCase();
      const found =
        invoices.find(
          (inv) =>
            inv.id.toLowerCase() === bid ||
            inv.id.toLowerCase().includes(bid) ||
            // Support searching without INV- prefix
            inv.id.replace(/^inv-/i, "").toLowerCase() === bid,
        ) ?? null;
      setInvoice(found);
      setSearched(true);
      setLoading(false);
    }, 500); // small delay for UX
  }

  return (
    <main className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            Customer Portal
          </p>
          <h1 className="font-heading font-bold text-4xl text-brand-blue mb-4">
            Check Your Bill
          </h1>
          <p className="text-muted-foreground">
            Enter your Invoice Number to view and download your bill.
          </p>
        </div>

        {/* Search form */}
        <Card className="border-2 border-brand-blue-mid shadow-card mb-8 animate-fade-in-up animate-delay-100">
          <CardContent className="p-6">
            <form
              onSubmit={handleSearch}
              className="space-y-4"
              data-ocid="bill_check.modal"
            >
              <div>
                <Label
                  htmlFor="bill-no"
                  className="text-brand-blue font-semibold"
                >
                  Invoice Number
                </Label>
                <Input
                  id="bill-no"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  placeholder="e.g. INV-001 or just 001"
                  className="mt-1"
                  required
                  data-ocid="bill_check.input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue text-white hover:bg-brand-blue-dark font-semibold h-12"
                data-ocid="bill_check.submit_button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> Check Bill
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info hint */}
        <Card className="border border-brand-gold/40 bg-brand-gold/5 mb-8">
          <CardContent className="p-4 flex gap-3">
            <Info className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-brand-blue mb-1">
                How to find your Invoice Number:
              </p>
              <p className="text-muted-foreground">
                Your invoice number is printed on your receipt (e.g.{" "}
                <strong>INV-1234567890</strong>). Ask the shopkeeper if you
                don&apos;t have it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {searched &&
          !loading &&
          (invoice ? (
            <div
              className="animate-fade-in"
              data-ocid="bill_check.success_state"
            >
              <InvoiceView invoice={invoice} />
            </div>
          ) : (
            <Card
              className="border-2 border-destructive/30 bg-destructive/5"
              data-ocid="bill_check.error_state"
            >
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="font-heading font-bold text-xl text-destructive mb-2">
                  Bill Not Found
                </h3>
                <p className="text-muted-foreground">
                  No invoice found with that number. Please check the invoice
                  number and try again.
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </main>
  );
}
