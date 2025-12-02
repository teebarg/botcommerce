import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayout/collections/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_mainLayout/collections/$slug"!</div>
}
