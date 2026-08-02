import { renderToStaticMarkup } from "react-dom/server";
import { defaultUrlTransform } from "react-markdown";
import { describe, expect, it } from "vitest";
import { MarkdownBase } from "../standalone";

const dataImage = "data:image/svg+xml,%3Csvg%2F%3E";
const content = `![custom emoji](${dataImage})`;

describe("MarkdownBase urlTransform", () => {
  it("keeps react-markdown's safe URL policy by default", () => {
    const markup = renderToStaticMarkup(<MarkdownBase content={content} />);

    expect(markup).toContain('alt="custom emoji"');
    expect(markup).not.toContain(`src="${dataImage}"`);
  });

  it("lets consumers explicitly allow trusted data image URLs", () => {
    const markup = renderToStaticMarkup(
      <MarkdownBase
        content={content}
        urlTransform={(url, key) =>
          key === "src" && url.startsWith("data:image/")
            ? url
            : defaultUrlTransform(url)
        }
      />,
    );

    expect(markup).toContain(`src="${dataImage}"`);
  });
});
