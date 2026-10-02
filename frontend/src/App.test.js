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
  expect(await screen.findByText("Welcome back, Alice!")).toBeInTheDocument(); // toast
  expect(await screen.findByText("No todos here.")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBe("fake-token");
});

test("adding a todo shows it in the list with a success toast", async () => {
  localStorage.setItem("token", "fake-token"); // already logged in
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(200, { user: { id: "1", name: "Alice" } })) // GET /api/auth/me
    .mockResolvedValueOnce(response(200, [])) // GET /api/todos
    .mockResolvedValueOnce(response(201, { id: "t1", text: "Buy milk", completed: false })); // POST

  render(<App />);
  await userEvent.type(await screen.findByLabelText("New todo"), "Buy milk");
  await userEvent.click(screen.getByRole("button", { name: "Add" }));

  expect(await screen.findByText("Buy milk")).toBeInTheDocument();
  expect(await screen.findByText("Todo added")).toBeInTheDocument();
  expect(screen.getByLabelText("New todo")).toHaveValue(""); // input cleared
});

test("a failed request shows an error toast and keeps the typed text", async () => {
  localStorage.setItem("token", "fake-token");
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(200, { user: { id: "1", name: "Alice" } }))
    .mockResolvedValueOnce(response(200, []))
    .mockResolvedValueOnce(response(500, { error: "Something went wrong" }));

  render(<App />);
  await userEvent.type(await screen.findByLabelText("New todo"), "Buy milk");
  await userEvent.click(screen.getByRole("button", { name: "Add" }));

  expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  expect(screen.getByLabelText("New todo")).toHaveValue("Buy milk");
});

test("progress bar shows how many todos are done", async () => {
  localStorage.setItem("token", "fake-token");
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(200, { user: { id: "1", name: "Alice" } }))
    .mockResolvedValueOnce(
      response(200, [
        { id: "a", text: "One", completed: true },
        { id: "b", text: "Two", completed: false },
        { id: "c", text: "Three", completed: false },
        { id: "d", text: "Four", completed: false },
      ])
    )
    .mockResolvedValueOnce(response(200, { id: "b", text: "Two", completed: true })); // PUT (toggle)

  render(<App />);
  expect(await screen.findByText("1 of 4 done")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");

  // Ticking another todo updates the progress
  await userEvent.click(screen.getByLabelText('Mark "Two" as complete'));
  expect(await screen.findByText("2 of 4 done")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
});

test("dark mode toggle switches the theme and remembers it", async () => {
  render(<App />);
  const toggle = screen.getByRole("button", { name: "Switch to dark mode" });

  await userEvent.click(toggle);
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(localStorage.getItem("theme")).toBe("dark");

  await userEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("theme")).toBe("light");
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
