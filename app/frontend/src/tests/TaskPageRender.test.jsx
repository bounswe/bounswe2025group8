import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import TaskPage from "../pages/TaskPage.jsx";

// Mock component dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ taskId: "123" }),
  };
});

// Mock the TaskDetailComponent
vi.mock("../components/TaskDetailComponent", () => ({
  default: ({ task }) => (
    <div data-testid="task-detail-component">
      <div>Task: {task.title}</div>
      <div>Description: {task.description}</div>
    </div>
  ),
}));

describe("TaskPage Component Rendering", () => {
  // Mock task data
  const mockTask = {
    id: "123",
    title: "I need to clean my house",
    description:
      "Minim sit fugiat est dolor laboris nisi ullamco cillum reprehenderit nulla aute.",
    status: "Open",
    taskType: "House Cleaning",
    urgencyLevel: "Low Urgency",
    createdAt: "2023-05-01T10:00:00Z",
    location: "848 King Street, Denver, CO 80204",
    creator: {
      id: 1,
      name: "Ashley Robinson",
      rating: 4.8,
    },
    volunteers: [],
    tags: ["Cleaning", "House", "Assistance"],
  };

  // Setup global timeout to handle loading state
  vi.useFakeTimers();

  beforeEach(() => {
    // Mock the useState to bypass fetching
    vi.spyOn(React, "useState").mockImplementationOnce(() => [false, vi.fn()]); // loading
    vi.spyOn(React, "useState").mockImplementationOnce(() => [
      mockTask,
      vi.fn(),
    ]); // task
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders task title correctly", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    // Expect task title to be in the document
    expect(screen.getByText("I need to clean my house")).toBeInTheDocument();
  });

  it("displays task status", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows task type information", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(screen.getByText("House Cleaning")).toBeInTheDocument();
  });

  it("displays urgency level", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Low Urgency")).toBeInTheDocument();
  });

  it("shows creator information", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Ashley Robinson")).toBeInTheDocument();
    expect(screen.getByText(/4.8/)).toBeInTheDocument();
  });

  it("renders task location", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText("848 King Street, Denver, CO 80204")
    ).toBeInTheDocument();
  });
  it("displays loading indicator when loading", () => {
    // Override the loading state
    vi.spyOn(React, "useState").mockRestore();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [true, vi.fn()]); // loading
    vi.spyOn(React, "useState").mockImplementationOnce(() => [null, vi.fn()]); // task

    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays error message when task is not found", () => {
    // Override the loading and task state
    vi.spyOn(React, "useState").mockRestore();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [false, vi.fn()]); // loading
    vi.spyOn(React, "useState").mockImplementationOnce(() => [null, vi.fn()]); // task is null (not found)

    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Task not found")).toBeInTheDocument();
    expect(screen.getByText("Back to Task List")).toBeInTheDocument();
  });

  it("displays task tags correctly", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    mockTask.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });
});
