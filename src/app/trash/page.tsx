"use client";

import TableWrapper from "@/components/table/TableWrapper";
import { Suspense } from "react";

export default function TrashPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="pt-10">
        <TableWrapper />
      </div>
    </Suspense>
  );
}
