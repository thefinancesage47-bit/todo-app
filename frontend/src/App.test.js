import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  );
});

test("renders the app heading and empty state", async () => {
  render(<App />);
  expect(screen.getByText("Todo App")).toBeInTheDocument();
  expect(await screen.findByText("No todos here.")).toBeInTheDocument();
});
