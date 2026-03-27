import { Button } from "@/components/ui/button";
import type { Invoice } from "@/lib/storage";
import { Printer } from "lucide-react";

const LOGO =
  "/assets/uploads/screenshot_2026-03-26_231047-019d2b57-e48c-70e8-9b2c-db4c4ce8391c-1.png";

interface Props {
  invoice: Invoice;
  onClose?: () => void;
}

export default function InvoiceView({ invoice, onClose }: Props) {
  return (
    <div className="bg-white">
      {/* Print / Close buttons — hidden when printing */}
      <div className="no-print flex gap-3 mb-6 justify-end">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            ← Back
          </Button>
        )}
        <Button
          onClick={() => window.print()}
          className="bg-brand-blue text-white hover:bg-brand-blue-dark"
        >
          <Printer className="w-4 h-4 mr-2" /> Download / Print PDF
        </Button>
      </div>

      {/* Invoice content */}
      <div
        id="invoice-print-area"
        className="border-2 border-brand-blue-mid rounded-lg p-6 max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-brand-blue pb-4 mb-4">
          <div className="flex justify-center mb-2">
            <img
              src={LOGO}
              alt="ID&PC Chak Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="font-heading font-bold text-2xl text-brand-blue">
            Ihsan Designing & Printing Center Chak
          </h1>
          <p className="text-muted-foreground text-sm font-semibold mt-1">
            CEO: Kamran Ali
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Phone: +92 305 7855334
          </p>
          <p className="text-muted-foreground text-sm">
            Address: Rustam Road Chak Near nako Number 1 Chak District Shikarpur
          </p>
          <p className="text-muted-foreground text-sm">
            Email: ihsanprintingcnetrechak@gmail.com
          </p>
        </div>

        {/* Invoice details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-brand-blue">Invoice No:</span>{" "}
              {invoice.id}
            </p>
            <p>
              <span className="font-semibold text-brand-blue">User ID:</span>{" "}
              {invoice.userId}
            </p>
            <p>
              <span className="font-semibold text-brand-blue">Date:</span>{" "}
              {invoice.date}
            </p>
          </div>
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-brand-blue">Customer:</span>{" "}
              {invoice.customerName}
            </p>
            <p>
              <span className="font-semibold text-brand-blue">Phone:</span>{" "}
              {invoice.phone}
            </p>
            <p>
              <span className="font-semibold text-brand-blue">Address:</span>{" "}
              {invoice.address}
            </p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full border-collapse border border-brand-blue-mid text-sm mb-6">
          <thead>
            <tr className="bg-brand-blue text-white">
              <th className="border border-brand-blue-mid p-2 text-left">
                Sr #
              </th>
              <th className="border border-brand-blue-mid p-2 text-left">
                Particular
              </th>
              <th className="border border-brand-blue-mid p-2 text-center">
                Qty
              </th>
              <th className="border border-brand-blue-mid p-2 text-center">
                Quality
              </th>
              <th className="border border-brand-blue-mid p-2 text-right">
                Rate (Rs)
              </th>
              <th className="border border-brand-blue-mid p-2 text-right">
                Total (Rs)
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.srNo} className="even:bg-muted/30">
                <td className="border border-brand-blue-mid p-2">
                  {item.srNo}
                </td>
                <td className="border border-brand-blue-mid p-2">
                  {item.particular}
                </td>
                <td className="border border-brand-blue-mid p-2 text-center">
                  {item.quantity}
                </td>
                <td className="border border-brand-blue-mid p-2 text-center">
                  {item.quality}
                </td>
                <td className="border border-brand-blue-mid p-2 text-right">
                  {item.rate.toFixed(2)}
                </td>
                <td className="border border-brand-blue-mid p-2 text-right font-medium">
                  {item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Grand Total:</span>
              <span className="font-bold text-brand-blue">
                Rs {invoice.grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Advance Paid:</span>
              <span>Rs {invoice.advance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between bg-brand-blue text-white px-3 py-2 rounded">
              <span className="font-bold">Balance Due:</span>
              <span className="font-bold">Rs {invoice.balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="border border-brand-blue-mid rounded p-3 mb-4">
          <p className="font-semibold text-brand-blue mb-1 text-sm">
            Terms & Conditions:
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {invoice.terms}
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground italic mt-6 border-t pt-4">
          No signature required for computerized invoice.
        </p>
      </div>
    </div>
  );
}
