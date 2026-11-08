import { ImageResponse } from "next/og";
import LogoMark from "@/components/LogoMark";

// The icon iPhones and iPads use when someone adds RepoGuide to their home screen.
// It's drawn once at build time.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      // iOS rounds the corners itself, so fill the whole square with the brand green.
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#2c6a4c" }}>
        <LogoMark size={180} colors={{ background: "#2c6a4c", foreground: "#ffffff" }} />
      </div>
    ),
    size,
  );
}
