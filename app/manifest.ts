import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pilates Diário",
    short_name: "Pilates Diário",
    start_url: "/aplicativo",
    display: "standalone",
    background_color: "#0C0C0C",
    theme_color: "#0C0C0C",
    icons: [
      {
        src: "/icons/pilates-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/pilates-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
