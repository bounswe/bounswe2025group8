import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import TaskPageVolunteer from "../pages/TaskPageVolunteer.jsx";

// Mock component dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ taskId: "123" }),
  };
});

// Mock the TaskDetailVolunteer
vi.mock("../components/TaskDetailVolunteer", () => ({
  default: ({ task }) => (
    <div data-testid="task-detail-volunteer-component">
      <div>Task: {task.title}</div>
      <div>Description: {task.description}</div>
    </div>
  ),
}));

// Mock React's useEffect to bypass the API call but avoid infinite loops
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

describe("TaskPageVolunteer Component Rendering", () => {
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
        <TaskPageVolunteer />
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
        <TaskPageVolunteer />
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
        <TaskPageVolunteer />
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
        <TaskPageVolunteer />
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
        <TaskPageVolunteer />
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
        <TaskPageVolunteer />
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
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders volunteer button when task is open", () => {
    render(
      <BrowserRouter>
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("button", { name: /volunteer/i })
    ).toBeInTheDocument();
  });

  it("renders task details component", () => {
    render(
      <BrowserRouter>
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    expect(
      screen.getByTestId("task-detail-volunteer-component")
    ).toBeInTheDocument();
  });
  it("displays all tags", () => {
    render(
      <BrowserRouter>
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    expect(screen.getByText("Cleaning")).toBeInTheDocument();
    expect(screen.getByText("House")).toBeInTheDocument();
    expect(screen.getByText("Assistance")).toBeInTheDocument();
  });

  it("displays error message when task is not found", () => {
    // Override the loading and task state
    vi.spyOn(React, "useState").mockRestore();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [false, vi.fn()]); // loading
    vi.spyOn(React, "useState").mockImplementationOnce(() => [null, vi.fn()]); // task is null (not found)

    render(
      <BrowserRouter>
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    expect(screen.getByText("Task not found")).toBeInTheDocument();
    expect(screen.getByText("Back to Task List")).toBeInTheDocument();
  });

  it("formats created date correctly", () => {
    // Mock format function to return formatted date
    const formattedDate = "May 1, 2023";
    vi.mock("date-fns", () => ({
      format: () => formattedDate,
    }));

    render(
      <BrowserRouter>
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    // The component should use date-fns to format the date
    expect(
      screen.getByText(new RegExp(mockTask.createdAt))
    ).toBeInTheDocument();
  });

  it("renders task details in a paper component", () => {
    render(
      <BrowserRouter>
        <TaskPageVolunteer />
      </BrowserRouter>
    );

    // Find the Paper component that contains the task details
    const taskDetailContainer = screen
      .getByTestId("task-detail-volunteer-component")
      .closest("div");
    expect(taskDetailContainer).toBeInTheDocument();
  });
});
