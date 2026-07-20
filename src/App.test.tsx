import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { expect, test } from "vitest";
import App from "@/App";

test("renders the starter screen", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  expect(screen.getByRole("heading", { name: /frontend boilerplate/i })).toBeInTheDocument();
});
