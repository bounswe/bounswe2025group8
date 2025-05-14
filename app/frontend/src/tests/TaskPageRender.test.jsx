import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

// Mock the useEffect hook to bypass the API call but avoid infinite loops
vi.mock("react", async () => {
  const original = await vi.importActual("react");
  return {
    ...original,
    useEffect: (callback, deps) => {
      // Only execute the callback once to avoid infinite loops
      if (deps && deps.length === 0) {
        // Only run once for empty dependency arrays
        callback();
      } else {
        // For non-empty deps, use the original behavior
        original.useEffect(callback, deps);
      }
    },
  };
});

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

  beforeEach(() => {
    // Mock setTimeout to run immediately
    vi.useFakeTimers();
    vi.spyOn(global, "setTimeout").mockImplementation((cb) => {
      cb();
      return 999;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  it("renders task title correctly", async () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    // Give a little time for the mocked setTimeout to run
    await vi.runAllTimersAsync();

    // First find all elements with the title text
    const titleElements = screen.getAllByText(/I need to clean my house/i);
    expect(titleElements.length).toBeGreaterThan(0);

    // Verify at least one of them is a heading
    const headings = titleElements.filter(
      (el) =>
        el.tagName === "H5" ||
        el.tagName === "H4" ||
        el.tagName === "H6" ||
        el.getAttribute("role") === "heading"
    );
    expect(headings.length).toBeGreaterThan(0);
  });
  it("displays task status", async () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    await vi.runAllTimersAsync();

    // Use a more flexible text matcher for status
    const statusElement = screen.getByText((content) => {
      return content.includes("Open");
    });
    expect(statusElement).toBeInTheDocument();
  });
  it("shows task type information", async () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    await vi.runAllTimersAsync();

    // Use a more flexible text matcher for task type
    const taskTypeElement = screen.getByText((content) => {
      return content.includes("House Cleaning");
    });
    expect(taskTypeElement).toBeInTheDocument();
  });

  it("displays urgency level", async () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    await vi.runAllTimersAsync();

    // Use a more flexible text matcher for urgency
    const urgencyElement = screen.getByText((content) => {
      return content.includes("Low Urgency");
    });
    expect(urgencyElement).toBeInTheDocument();
  });
  it("shows creator information", async () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    await vi.runAllTimersAsync();

    // Use more flexible text matchers for creator info
    const creatorNameElement = screen.getByText((content) => {
      return content.includes("Ashley Robinson");
    });
    expect(creatorNameElement).toBeInTheDocument();

    const creatorRatingElement = screen.getByText((content) => {
      return content.includes("4.8");
    });
    expect(creatorRatingElement).toBeInTheDocument();
  });

  it("renders task location", async () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    await vi.runAllTimersAsync();

    // Use a more flexible text matcher for location
    const locationElement = screen.getByText((content) => {
      return content.includes("848 King Street, Denver, CO 80204");
    });
    expect(locationElement).toBeInTheDocument();
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
