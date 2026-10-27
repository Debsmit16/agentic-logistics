"use client";

/**
 * Isolates and prints an HTML element cleanly in exactly 1 single page.
 * Uses a dedicated, isolated print iframe to ensure ZERO modal chrome,
 * ZERO dashboard tables, ZERO backdrops, and ZERO multi-page overflows.
 */
export function printIsolatedElement(elementId: string, pageType: "thermal" | "a4" = "thermal") {
  if (typeof window === "undefined") return;

  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Print element #${elementId} not found`);
    return;
  }

  // 1. Remove any previous print iframe
  const existingIframe = document.getElementById("erp-print-iframe");
  if (existingIframe && existingIframe.parentNode) {
    existingIframe.parentNode.removeChild(existingIframe);
  }

  // 2. Create an isolated iframe with explicit physical dimensions
  // This prevents Chromium from assuming a 0px viewport which causes multi-page text wrapping
  const iframe = document.createElement("iframe");
  iframe.id = "erp-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = pageType === "thermal" ? "4in" : "210mm";
  iframe.style.height = pageType === "thermal" ? "6in" : "297mm";
  iframe.style.border = "none";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  // 3. Extract active stylesheets and styles from document head
  const styleNodes = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"));
  const styleSheets = styleNodes.map((node) => node.outerHTML).join("\n");

  // 4. Strict CSS enforcing exactly 1 single page without any overflow
  const strictPrintCss =
    pageType === "thermal"
      ? `
    @page {
      size: 4in 6in;
      margin: 0 !important;
    }
    *, *::before, *::after {
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 4in !important;
      height: 6in !important;
      max-width: 4in !important;
      max-height: 6in !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;
    }
    #thermal-shipping-label {
      width: 3.85in !important;
      max-width: 3.85in !important;
      height: 5.75in !important;
      max-height: 5.75in !important;
      margin: 0.1in auto !important;
      padding: 10px !important;
      box-sizing: border-box !important;
      border: 2px solid #000000 !important;
      box-shadow: none !important;
      background: #ffffff !important;
      color: #000000 !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;
    }
    /* Hide any buttons or interactive controls that might be inside */
    button, input, select, textarea, .no-print {
      display: none !important;
    }
  `
      : `
    @page {
      size: A4 portrait;
      margin: 8mm !important;
    }
    *, *::before, *::after {
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;
    }
    #internal-manifest-letterhead {
      width: 100% !important;
      max-width: 194mm !important;
      margin: 0 auto !important;
      padding: 16px !important;
      border: 1px solid #cbd5e1 !important;
      box-shadow: none !important;
      background: #ffffff !important;
      color: #000000 !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;
    }
    button, input, select, textarea, .no-print {
      display: none !important;
    }
  `;

  // 5. Populate iframe document
  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) {
    console.error("Unable to access print iframe document");
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${pageType === "thermal" ? "Shipping Label" : "Internal Manifest"}</title>
        ${styleSheets}
        <style>
          ${strictPrintCss}
        </style>
      </head>
      <body>
        ${el.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  // 6. Focus and trigger print after styles and fonts parse
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Print invocation error:", err);
    } finally {
      // Clean up iframe after user completes print dialog
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 60000);
    }
  };

  // Give images (like logo in letterhead) and CSS fonts 250ms to ensure full fidelity
  setTimeout(triggerPrint, 250);
}
