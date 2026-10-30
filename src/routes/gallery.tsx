import { createFileRoute } from "@tanstack/react-router";
import PhotoboothApp from "@/components/photobooth/PhotoboothApp";

export const Route = createFileRoute("/gallery")({
  component: GalleryRouteComponent,
});

function GalleryRouteComponent() {
  return <PhotoboothApp routeStep="gallery" />;
}

