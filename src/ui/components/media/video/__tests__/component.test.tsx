// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Video } from "../component";

describe("Video", () => {
  it("renders a video element with the configured source", () => {
    const { container } = render(
      <Video
        config={{
          type: "video",
          src: "https://example.com/demo.mp4",
          controls: true,
        }}
      />,
    );

    const video = container.querySelector("video");
    expect(video?.getAttribute("src")).toBe("https://example.com/demo.mp4");
    expect(video?.hasAttribute("controls")).toBe(true);
  });
});
