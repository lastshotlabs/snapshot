import { describe, expect, it } from "vitest";
import { buildHeadTags } from "../head";

describe("buildHeadTags — basic tags", () => {
  it("returns empty string for undefined meta", () => {
    expect(buildHeadTags(undefined)).toBe("");
  });

  it("returns empty string for empty meta object", () => {
    expect(buildHeadTags({})).toBe("");
  });

  it("produces <title> tag", () => {
    expect(buildHeadTags({ title: "My Page" })).toContain(
      "<title>My Page</title>",
    );
  });

  it('produces <meta name="description">', () => {
    expect(buildHeadTags({ description: "About" })).toContain(
      '<meta name="description" content="About">',
    );
  });

  it('produces <link rel="canonical">', () => {
    expect(buildHeadTags({ canonical: "https://example.com/page" })).toContain(
      '<link rel="canonical" href="https://example.com/page">',
    );
  });

  it('produces <meta name="robots">', () => {
    expect(buildHeadTags({ robots: "noindex" })).toContain(
      '<meta name="robots" content="noindex">',
    );
  });
});

describe("buildHeadTags — XSS escaping", () => {
  it("escapes HTML in title", () => {
    const result = buildHeadTags({ title: "<script>xss</script>" });
    expect(result).toContain("&lt;script&gt;xss&lt;/script&gt;");
    expect(result).not.toContain("<script>");
  });

  it("escapes double quotes in description", () => {
    const result = buildHeadTags({ description: '" onload="xss"' });
    expect(result).toContain("&quot; onload=&quot;xss&quot;");
  });

  it("escapes HTML in OG tags", () => {
    const result = buildHeadTags({ og: { title: "<b>Bold</b>" } });
    expect(result).toContain("&lt;b&gt;Bold&lt;/b&gt;");
  });

  it("escapes single quotes in attribute values", () => {
    const result = buildHeadTags({ title: "O'Brien" });
    expect(result).toContain("O&#x27;Brien");
  });
});

describe("buildHeadTags — Open Graph", () => {
  it("produces og:title", () => {
    expect(buildHeadTags({ og: { title: "OG Title" } })).toContain(
      '<meta property="og:title" content="OG Title">',
    );
  });

  it("produces og:description", () => {
    expect(buildHeadTags({ og: { description: "Desc" } })).toContain(
      '<meta property="og:description" content="Desc">',
    );
  });

  it("produces og:image", () => {
    expect(
      buildHeadTags({ og: { image: "https://example.com/img.jpg" } }),
    ).toContain(
      '<meta property="og:image" content="https://example.com/img.jpg">',
    );
  });

  it("produces og:image:alt", () => {
    expect(buildHeadTags({ og: { imageAlt: "A photo" } })).toContain(
      '<meta property="og:image:alt" content="A photo">',
    );
  });

  it("produces og:site_name", () => {
    expect(buildHeadTags({ og: { siteName: "My Site" } })).toContain(
      '<meta property="og:site_name" content="My Site">',
    );
  });

  it("omits undefined og fields", () => {
    const tags = buildHeadTags({ og: { title: "Only Title" } });
    expect(tags).not.toContain("og:description");
    expect(tags).not.toContain("og:image");
  });
});

describe("buildHeadTags — Twitter Card", () => {
  it("produces twitter:card", () => {
    expect(
      buildHeadTags({ twitter: { card: "summary_large_image" } }),
    ).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it("produces twitter:title", () => {
    expect(buildHeadTags({ twitter: { title: "Tweet Title" } })).toContain(
      '<meta name="twitter:title" content="Tweet Title">',
    );
  });

  it("produces twitter:site", () => {
    expect(buildHeadTags({ twitter: { site: "@myhandle" } })).toContain(
      '<meta name="twitter:site" content="@myhandle">',
    );
  });
});

describe("buildHeadTags — JSON-LD", () => {
  it('produces <script type="application/ld+json">', () => {
    const tags = buildHeadTags({
      jsonLd: { "@type": "Article", name: "My Article" },
    });
    expect(tags).toContain('<script type="application/ld+json">');
    expect(tags).toContain("@type");
  });

  it("escapes </script> in JSON-LD to prevent XSS", () => {
    const tags = buildHeadTags({ jsonLd: { hack: "</script>" } });
    // The data should NOT appear as literal </script> before the closing </script>
    const withoutClosing = tags.replace(/<\/script>$/, "");
    expect(withoutClosing).not.toContain("</script>");
  });

  it("produces valid JSON inside the script tag", () => {
    const tags = buildHeadTags({ jsonLd: { "@type": "Person", name: "Jane" } });
    const match =
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(tags);
    expect(match).not.toBeNull();
    if (!match?.[1]) return;
    // JSON-LD uses pretty print with escaping — unescape <\/ back to </
    const json = (match[1] ?? "").replace(/<\\\/script>/g, "</script>");
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe("buildHeadTags — arbitrary meta tags", () => {
  it("renders arbitrary meta tags from the meta array", () => {
    const tags = buildHeadTags({
      meta: [{ name: "theme-color", content: "#ffffff" }],
    });
    expect(tags).toContain('<meta name="theme-color" content="#ffffff">');
  });

  it("renders multiple arbitrary meta tags", () => {
    const tags = buildHeadTags({
      meta: [
        { name: "theme-color", content: "#ffffff" },
        { name: "viewport", content: "width=device-width" },
      ],
    });
    expect(tags).toContain("theme-color");
    expect(tags).toContain("viewport");
  });
});

describe("buildHeadTags — combined", () => {
  it("renders all fields when provided", () => {
    const tags = buildHeadTags({
      title: "Full Page",
      description: "Full description",
      og: { title: "OG" },
      twitter: { card: "summary" },
    });
    expect(tags).toContain("<title>Full Page</title>");
    expect(tags).toContain("description");
    expect(tags).toContain("og:title");
    expect(tags).toContain("twitter:card");
  });
});
