import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, expect, test } from "vitest";
import App from "@/App";

afterEach(cleanup);

test("renders the HIMTI landing page", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  expect(screen.getByRole("heading", { name: /find your people/i })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /register|become a member|start your registration/i })).not.toHaveLength(0);
});

test("opens and closes the mobile navigation", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);

  const menuButton = screen.getByRole("button", { name: /open menu/i });
  await user.click(menuButton);
  expect(within(document.getElementById("mobile-navigation")!).getByRole("link", { name: "Membership" })).toBeInTheDocument();
  expect(menuButton).toHaveAttribute("aria-expanded", "true");

  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute("aria-expanded", "false");
});

test("renders the registration wizard and advances through the first step", async () => {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByRole("heading", { name: /tell us about yourself/i })).toBeInTheDocument();
  expect(screen.getAllByText(/Step 1 of 4/)).not.toHaveLength(0);
  expect(screen.getByLabelText(/registration progress, step 1 of 4/i)).toBeInTheDocument();
});

test("shows BINUS verification and clears institution details when the path changes", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={["/register"]}><App /></MemoryRouter>);

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
