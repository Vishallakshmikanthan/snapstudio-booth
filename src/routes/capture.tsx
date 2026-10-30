import { createFileRoute } from "@tanstack/react-router";
import PhotoboothApp from "@/components/photobooth/PhotoboothApp";

export const Route = createFileRoute("/capture")({
  component: CaptureRouteComponent,
});

function CaptureRouteComponent() {
  return <PhotoboothApp routeStep="capture" />;
}

