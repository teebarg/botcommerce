import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute('/_mainLayout/collections')({
  component: Outlet,
})
