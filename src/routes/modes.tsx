import { createFileRoute } from "@tanstack/react-router";
import PhotoboothApp from "@/components/photobooth/PhotoboothApp";

export const Route = createFileRoute("/modes")({
  component: ModesRouteComponent,
});

function ModesRouteComponent() {
  return <PhotoboothApp routeStep="mode" />;
}

