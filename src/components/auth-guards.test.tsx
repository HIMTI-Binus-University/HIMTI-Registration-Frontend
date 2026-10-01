import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { RequireIncompleteRegistration } from "./auth-guards";

let completed = false;
vi.mock("@/api/users/queries", () => ({
  useCurrentUser: () => ({
    data: { registrationCompleted: completed },
    isPending: false,
    isError: false,
  }),
}));
afterEach(cleanup);

test("profile refresh after submission keeps the completion page mounted", () => {
  completed = false;
  const page = () => (
    <MemoryRouter initialEntries={["/register"]}>
      <RequireIncompleteRegistration>
        <p>Registration form and completion</p>
      </RequireIncompleteRegistration>
    </MemoryRouter>
  );
  const view = render(page());
  completed = true;
  view.rerender(page());
  expect(
    screen.getByText("Registration form and completion"),
  ).toBeInTheDocument();
});
