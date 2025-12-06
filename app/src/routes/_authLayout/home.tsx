import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authLayout/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authLayout/home"!</div>
}
