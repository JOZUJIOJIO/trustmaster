import "server-only";

import { redirect } from "next/navigation";
import { hasAdminSession } from "./auth";

export async function requireAdmin() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
