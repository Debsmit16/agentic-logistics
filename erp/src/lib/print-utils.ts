"use client";

/**
 * Isolates and prints an HTML element cleanly with zero UI debris.
 * Uses a dedicated, isolated print iframe to ensure ZERO modal chrome,
 * ZERO dashboard tables, ZERO backdrops, and ZERO multi-page overflows.
 */
export function printIsolatedElement(
  elementId: string,
  pageType: "thermal" | "a4" = "thermal"
) {
  if (typeof window === "undefined") return;

  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Print element #${elementId} not found`);
    return;
  }

  // 1. Remove any previous print iframe to avoid duplicate DOM clutter
  const existingIframe = document.getElementById("erp-print-iframe");
  if (existingIframe && existingIframe.parentNode) {
    existingIframe.parentNode.removeChild(existingIframe);
  }

  // 2. Create an isolated iframe with explicit physical dimensions
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
  const styleNodes = Array.from(
    document.querySelectorAll("link[rel='stylesheet'], style")
  );
  const styleSheets = styleNodes.map((node) => node.outerHTML).join("\n");

  // 4. Strict CSS enforcing single-page fidelity and print color accuracy
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
      background: #ffffff !important;
      color: #000000 !important;
      font-family: Arial, Helvetica, "Liberation Sans", sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    #thermal-shipping-labels-container {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .thermal-label-page {
      width: 4in !important;
      height: 6in !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      break-after: page !important;
      break-inside: avoid !important;
    }
    .thermal-label-page:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    #thermal-shipping-label,
    .thermal-shipping-label {
      width: 3.8in !important;
      max-width: 3.8in !important;
      height: 5.6in !important;
      max-height: 5.6in !important;
      margin: 0.15in auto !important;
      padding: 8px 10px !important;
      box-sizing: border-box !important;
      border: 2px solid #000000 !important;
      box-shadow: none !important;
      background: #ffffff !important;
      color: #000000 !important;
      overflow: hidden !important;
      page-break-inside: avoid !important;
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
      color-adjust: exact !important;
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
      border: 1.5px solid #000000 !important;
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

  // 5. Populate iframe document with base href to correctly resolve assets
  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) {
    console.error("Unable to access print iframe document");
    return;
  }

  const baseHref = window.location.origin;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}/" />
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

  // 6. Focus and trigger print after checking all image assets are loaded
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

  // Wait for images inside iframe to complete loading before invoking print
  const checkReadyAndPrint = () => {
    const imgs = Array.from(iframeDoc.images || []);
    const allLoaded = imgs.length === 0 || imgs.every((img) => img.complete);
    if (allLoaded) {
      triggerPrint();
    } else {
      setTimeout(triggerPrint, 300);
    }
  };

  setTimeout(checkReadyAndPrint, 250);
}
