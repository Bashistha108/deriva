"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClientLogger() {
  const pathname = usePathname();

  useEffect(() => {
    console.log(`[Frontend] Navigation: Navigated to ${pathname}`);
  }, [pathname]);

  useEffect(() => {
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const resource = args[0];
      const config = args[1];
      const method = config?.method || 'GET';
      const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : 'Unknown URL');
      console.log(`[Frontend] Fetch: ${method} ${url}`);
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
