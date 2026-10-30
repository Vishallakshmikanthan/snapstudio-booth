import { createFileRoute } from "@tanstack/react-router";
import PhotoboothApp from "@/components/photobooth/PhotoboothApp";

export const Route = createFileRoute("/editor")({
  component: EditorRouteComponent,
});

function EditorRouteComponent() {
  return <PhotoboothApp routeStep="edit" />;
}

