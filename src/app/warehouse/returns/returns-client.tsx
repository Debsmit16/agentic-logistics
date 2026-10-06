"use client";

import { ShelfActionPage } from "@/components/warehouse/shelf-action-page";

export default function ReturnsClient() {
  return (
    <div className="space-y-8">
      <ShelfActionPage
        title="Receive return"
        actionLabel="Store return"
        endpoint="return-receive"
      />
    </div>
  );
}
