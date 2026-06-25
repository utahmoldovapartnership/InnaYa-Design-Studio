"use client";

import { makePage } from "@keystatic/next/ui/app";
import { KeystaticEnhancements } from "@/components/admin/KeystaticEnhancements";
import config from "../../../keystatic.config";
import "../edit-admin.css";

const KeystaticPage = makePage(config);

export default function Page() {
  return (
    <>
      <KeystaticEnhancements />
      <KeystaticPage />
    </>
  );
}
