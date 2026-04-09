import { render, screen } from "@testing-library/react";
import { App } from "../src/App";

jest.mock("../src/store/useAppStore", () => ({
  useAppStore: () => ({
    currentView: "dashboard",
    projects: [],
    createProject: jest.fn(),
    deleteProject: jest.fn(),
    openProject: jest.fn(),
    loadDemoProjects: jest.fn(),
  }),
}));

test("App renders dashboard by default", () => {
  render(<App />);
  const heading = screen.getByText(/Visual Website Planner/i);
  expect(heading).toBeInTheDocument();
});
