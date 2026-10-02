import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// A fake fetch response with the given HTTP status and JSON body
const response = (status, body) => ({ ok: status < 400, status, json: () => Promise.resolve(body) });

beforeEach(() => localStorage.clear());

test("shows the login form when not logged in", () => {
  render(<App />);
  expect(screen.getByText("Welcome back")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
});

test("logs in, stores the token and shows the todo page", async () => {
  // Each fetch call gets the next response: first the login, then the todo list
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(200, { token: "fake-token", user: { id: "1", name: "Alice" } }))
    .mockResolvedValueOnce(response(200, []));

  render(<App />);
  await userEvent.type(screen.getByPlaceholderText("Email"), "a@test.com");
  await userEvent.type(screen.getByPlaceholderText("Password"), "secret1");
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByText("Hi, Alice")).toBeInTheDocument();
  expect(await screen.findByText("No todos here.")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBe("fake-token");
});

test("shows the server's error message when login fails", async () => {
  global.fetch = jest.fn().mockResolvedValueOnce(response(401, { error: "Invalid email or password" }));

  render(<App />);
  await userEvent.type(screen.getByPlaceholderText("Email"), "a@test.com");
  await userEvent.type(screen.getByPlaceholderText("Password"), "wrong");
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
});
