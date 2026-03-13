import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forbidden')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/forbidden"!</div>
}
