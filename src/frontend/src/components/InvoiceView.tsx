import { Button } from "@/components/ui/button";
import { useLogo } from "@/hooks/useQueries";
import type { Invoice } from "@/lib/storage";
import { Printer } from "lucide-react";

interface Props {
  invoice: Invoice;
  onClose?: () => void;
}

function computeSubtotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.total, 0);
}

function computeDiscount(invoice: Invoice): number {
  // BUG-004 FIX: Use the stored discount field directly instead of computing from grandTotal
  return Math.max(0, Number(invoice.discount ?? 0));
}

export default function InvoiceView({ invoice, onClose }: Props) {
  const { data: logo } = useLogo();

  const subtotal = computeSubtotal(invoice);
  const discountAmt = computeDiscount(invoice);
  const discountPct =
    subtotal > 0 ? Math.round((discountAmt / subtotal) * 100) : 0;

  return (
    <div className="bg-white">
      {/* Action buttons — hidden when printing */}
      <div className="no-print flex gap-3 mb-6 justify-end">
        {onClose && (
          <Button variant="outline" onClick={onClose} className="btn-3d">
            ← Back
          </Button>
        )}
        <Button
          onClick={() => window.print()}
          className="bg-brand-blue text-white hover:bg-brand-blue-dark btn-3d btn-3d-blue"
        >
          <Printer className="w-4 h-4 mr-2" /> Download / Print PDF
        </Button>
      </div>

      {/* ===== PROFESSIONAL INVOICE ===== */}
      <div
        id="invoice-print-area"
        className="max-w-3xl mx-auto bg-white"
        style={{
          border: "2px solid #1a3a6b",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(26,58,107,0.15)",
        }}
      >
        {/* ── HEADER BAND ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a3a6b 0%, #1e4d8c 100%)",
            padding: "24px 32px",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {logo && (
                <img
                  src={logo}
                  alt="ID&PC Chak Logo"
                  style={{
                    height: 64,
                    width: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                />
              )}
              <div>
                <h1
                  style={{
                    color: "#c9a227",
                    fontWeight: 800,
                    fontSize: 20,
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Ihsan Designing &amp; Printing
                </h1>
                <h2
                  style={{
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Center Chak (ID&amp;PC Chak)
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    margin: "4px 0 0",
                  }}
                >
                  Rustam Road Chak, District Shikarpur
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  📞 +92 305 7855334 &nbsp;|&nbsp; ✉
                  ihsanprintingcnetrechak@gmail.com
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  background: "#c9a227",
                  color: "#1a3a6b",
                  fontWeight: 800,
                  fontSize: 22,
                  padding: "6px 18px",
                  borderRadius: 8,
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                INVOICE
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                <strong style={{ color: "#c9a227" }}>#</strong> {invoice.id}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  margin: 0,
                }}
              >
                {invoice.date}
              </p>
            </div>
          </div>
        </div>

        {/* ── CUSTOMER INFO STRIP ── */}
        <div
          style={{
            background: "#f0f5ff",
            borderBottom: "2px solid #dde7ff",
            padding: "16px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1a3a6b",
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 2px",
              }}
            >
              Customer Name
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {invoice.customerName || "—"}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1a3a6b",
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 2px",
              }}
            >
              Customer ID
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {invoice.userId || "—"}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1a3a6b",
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 2px",
              }}
            >
              Phone
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {invoice.phone || "—"}
            </p>
          </div>
          {invoice.address && (
            <div style={{ gridColumn: "1 / -1" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#1a3a6b",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  margin: "0 0 2px",
                }}
              >
                Address
              </p>
              <p style={{ fontSize: 13, color: "#333", margin: 0 }}>
                {invoice.address}
              </p>
            </div>
          )}
        </div>

        {/* ── ITEMS TABLE ── */}
        <div style={{ padding: "0 0" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  background: "linear-gradient(90deg, #1a3a6b, #1e4d8c)",
                  color: "white",
                }}
              >
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Sr #
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Particular / Description
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Quality
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Rate (Rs)
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Total (Rs)
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr
                  key={item.srNo}
                  style={{
                    background: idx % 2 === 0 ? "#ffffff" : "#f5f8ff",
                    borderBottom: "1px solid #dde7ff",
                  }}
                >
                  <td style={{ padding: "9px 12px", color: "#666" }}>
                    {item.srNo}
                  </td>
                  <td style={{ padding: "9px 12px", fontWeight: 500 }}>
                    {item.particular}
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      textAlign: "center",
                      color: "#555",
                    }}
                  >
                    {item.quality}
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "right" }}>
                    Rs {Number(item.rate).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#1a3a6b",
                    }}
                  >
                    Rs {Number(item.total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS SECTION ── */}
        <div
          style={{
            padding: "16px 32px 20px",
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "2px solid #dde7ff",
            background: "#f8faff",
          }}
        >
          <div style={{ minWidth: 260 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                borderBottom: "1px solid #dde7ff",
              }}
            >
              <span style={{ fontSize: 13, color: "#555" }}>Subtotal:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Rs {subtotal.toLocaleString()}
              </span>
            </div>
            {discountAmt > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid #dde7ff",
                }}
              >
                <span style={{ fontSize: 13, color: "#c0392b" }}>
                  Discount ({discountPct}%):
                </span>
                <span
                  style={{ fontSize: 13, color: "#c0392b", fontWeight: 600 }}
                >
                  - Rs {discountAmt.toLocaleString()}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#1a3a6b",
                color: "white",
                borderRadius: 6,
                marginTop: 4,
                marginBottom: 6,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Grand Total:
              </span>
              <span style={{ fontWeight: 800, fontSize: 15 }}>
                Rs {Number(invoice.grandTotal).toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                borderBottom: "1px solid #dde7ff",
              }}
            >
              <span style={{ fontSize: 13, color: "#555" }}>Advance Paid:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a7a4a" }}>
                Rs {Number(invoice.advance).toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: Number(invoice.balance) > 0 ? "#c0392b" : "#1a7a4a",
                color: "white",
                borderRadius: 6,
                marginTop: 6,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Balance Due:
              </span>
              <span style={{ fontWeight: 800, fontSize: 14 }}>
                Rs {Number(invoice.balance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── TERMS & CONDITIONS ── */}
        {invoice.terms && (
          <div
            style={{
              margin: "0 32px 20px",
              border: "1px solid #dde7ff",
              borderRadius: 8,
              padding: "12px 16px",
              background: "#fff",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                color: "#1a3a6b",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Terms &amp; Conditions
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#555",
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {invoice.terms}
            </p>
          </div>
        )}

        {/* ── SIGNATURE AREA ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: "16px 32px 24px",
            borderTop: "1px solid #dde7ff",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                borderTop: "2px solid #1a3a6b",
                paddingTop: 6,
                marginTop: 36,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1a3a6b",
                  margin: 0,
                }}
              >
                Customer Signature
              </p>
              <p style={{ fontSize: 11, color: "#888", margin: 0 }}>
                {invoice.customerName}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                borderTop: "2px solid #c9a227",
                paddingTop: 6,
                marginTop: 36,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1a3a6b",
                  margin: 0,
                }}
              >
                Authorized Signatory
              </p>
              <p style={{ fontSize: 11, color: "#888", margin: 0 }}>
                ID&amp;PC Chak — Kamran Ali (CEO)
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER BAND ── */}
        <div
          style={{
            background: "linear-gradient(90deg, #1a3a6b, #c9a227 80%, #1a3a6b)",
            color: "white",
            textAlign: "center",
            padding: "10px 24px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Thank you for your business! — Ihsan Designing &amp; Printing Center
          Chak (ID&amp;PC Chak)
        </div>
      </div>
    </div>
  );
}
