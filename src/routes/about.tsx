import { createFileRoute } from "@tanstack/react-router";
import PhotoboothApp from "@/components/photobooth/PhotoboothApp";

export const Route = createFileRoute("/about")({
  component: AboutRouteComponent,
});

function AboutRouteComponent() {
  return <PhotoboothApp routeStep="about" />;
}

