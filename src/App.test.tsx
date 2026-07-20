import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, expect, test } from "vitest";
import type React from "react";
import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

afterEach(cleanup);

function renderApp(ui: React.ReactNode) {
  return render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);
}

test("renders the HIMTI landing page", () => {
  renderApp(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  expect(screen.getByRole("heading", { name: /join once/i })).toBeInTheDocument();
  expect(screen.getByText(/register as a himti member to unlock event registration/i)).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /register|start registration/i })).toHaveLength(2);
  expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: /discover himti/i })).toHaveAttribute("href", "https://ofog.himtibinus.or.id");
});

test("renders the registration wizard and advances through the first step", async () => {
  renderApp(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByRole("heading", { name: /tell us about yourself/i })).toBeInTheDocument();
  expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  expect(screen.getAllByText(/Step 1 of 4/)).not.toHaveLength(0);
  expect(screen.getByLabelText(/registration progress, step 1 of 4/i)).toBeInTheDocument();
});

test("renders the member dashboard sections", () => {
  renderApp(<MemoryRouter initialEntries={["/dashboard"]}><App /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: "HIMTI Member" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Your Events" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Member support" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /edit profile/i })).toBeInTheDocument();
  expect(screen.getByText("Grup SOCS B30")).toBeInTheDocument();
  expect(screen.getByText("Dara Anggraini")).toBeInTheDocument();
});

test("shows BINUS verification and clears institution details when the path changes", async () => {
  const user = userEvent.setup();
  renderApp(<MemoryRouter initialEntries={["/register"]}><App /></MemoryRouter>);

  await user.click(screen.getByRole("button", { name: "Student" }));
  await user.click(screen.getByRole("button", { name: "BINUS" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.type(screen.getByLabelText(/full name/i), "HIMTI Member");
  await user.type(screen.getByLabelText(/phone number/i), "08123456789");
  await user.type(screen.getByLabelText(/personal email/i), "member@example.com");
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByLabelText(/binus major/i).tagName).toBe("SELECT");
  expect(screen.getByText(/verify your binus email/i)).toBeInTheDocument();
  await user.type(screen.getByLabelText(/^nim/i), "2600000000");
  await user.click(screen.getByRole("button", { name: /back/i }));
  await user.click(screen.getByRole("button", { name: /back/i }));
  await user.click(screen.getByRole("button", { name: "Lecturer" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByLabelText(/full name/i)).toHaveValue("HIMTI Member");
  expect(screen.getByText(/institution details were cleared/i)).toBeInTheDocument();
});
