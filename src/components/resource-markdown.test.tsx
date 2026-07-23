import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResourceMarkdown } from "./resource-markdown";

describe("ResourceMarkdown", () => {
  it("renders member resource formatting", () => {
    const { container } = render(
      <ResourceMarkdown>{`**Contact Person**
First line
Second line

- Alya
- \`alya-putri\``}</ResourceMarkdown>,
    );

    expect(screen.getByText("Contact Person").tagName).toBe("STRONG");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("alya-putri").tagName).toBe("CODE");
    expect(container.querySelector("br")).toBeInTheDocument();
  });

  it("allows only safe external links", () => {
    render(
      <ResourceMarkdown>
        {"[WhatsApp](https://wa.me/628123456789) [Unsafe](javascript:alert(1))"}
      </ResourceMarkdown>,
    );

    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(
      screen.queryByRole("link", { name: "Unsafe" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Unsafe")).toBeInTheDocument();
  });

  it("does not render raw HTML", () => {
    const { container } = render(
      <ResourceMarkdown>{'<script>alert("xss")</script>'}</ResourceMarkdown>,
    );
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders one break per newline and preserves ordered-list start values", () => {
    const { container } = render(
      <ResourceMarkdown>{`Contact Alya
Second line

3. Third
4. Fourth`}</ResourceMarkdown>,
    );

    expect(container.querySelectorAll("br")).toHaveLength(1);
    expect(container.querySelector("p")).not.toHaveClass("whitespace-pre-wrap");
    expect(container.querySelector("ol")).toHaveAttribute("start", "3");
  });
});
