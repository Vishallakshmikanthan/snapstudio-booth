import { createFileRoute } from "@tanstack/react-router";
import PhotoboothApp from "@/components/photobooth/PhotoboothApp";

export const Route = createFileRoute("/")({
  component: IndexRouteComponent,
});

function IndexRouteComponent() {
  return <PhotoboothApp routeStep="landing" />;
}
