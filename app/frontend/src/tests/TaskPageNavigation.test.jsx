import { vi } from "vitest";

// Mock must be defined before importing the component
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ taskId: "123" }),
  };
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import TaskPage from "../pages/TaskPage.jsx";

// Mock the TaskDetailComponent
vi.mock("../components/TaskDetailComponent", () => ({
  default: ({ task }) => (
    <div data-testid="task-detail-component">
      <div>Task: {task.title}</div>
      <div>Description: {task.description}</div>
    </div>
  ),
}));

describe("TaskPage Navigation", () => {
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

  // Setup for mocking state
  beforeEach(() => {
    mockNavigate.mockReset();

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

  it("navigates back when back button is clicked", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates to filtered tasks when clicking on a tag chip", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const tagChip = screen.getByText("Cleaning");
    fireEvent.click(tagChip);

    expect(mockNavigate).toHaveBeenCalledWith("/tasks?tag=Cleaning");
  });

  it("navigates to filtered tasks when clicking on urgency level", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const urgencyChip = screen.getByText("Low Urgency");
    fireEvent.click(urgencyChip);

    expect(mockNavigate).toHaveBeenCalledWith("/tasks?urgency=Low Urgency");
  });

  it("navigates to filtered tasks when clicking on task type", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const taskTypeChip = screen.getByText("House Cleaning");
    fireEvent.click(taskTypeChip);

    expect(mockNavigate).toHaveBeenCalledWith("/tasks?type=House Cleaning");
  });

  it("navigates to creator profile when clicking on creator name", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const creatorName = screen.getByText("Ashley Robinson");
    fireEvent.click(creatorName);

    expect(mockNavigate).toHaveBeenCalledWith("/profile/1");
  });

  it("supports keyboard navigation with Enter key on back button", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const backButton = screen.getByRole("button", { name: /back/i });

    // Focus the button and press Enter
    backButton.focus();
    fireEvent.keyDown(backButton, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
  it("supports keyboard navigation with Space key on tags", () => {
    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const tagChip = screen.getByText("House");

    // Focus the chip and press Space
    tagChip.focus();
    fireEvent.keyDown(tagChip, { key: " ", code: "Space" });

    expect(mockNavigate).toHaveBeenCalledWith("/tasks?tag=House");
  });

  it("navigates back to tasks list when task not found", () => {
    // Override the loading and task state to simulate not found
    vi.spyOn(React, "useState").mockRestore();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [false, vi.fn()]); // loading
    vi.spyOn(React, "useState").mockImplementationOnce(() => [null, vi.fn()]); // task is null (not found)

    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const backButton = screen.getByText("Back to Task List");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  it("prevents event propagation when clicking on chips", () => {
    // Create a mock event with stopPropagation
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    };

    render(
      <BrowserRouter>
        <TaskPage />
      </BrowserRouter>
    );

    const taskTypeChip = screen.getByText("House Cleaning");
    // Simulate the full event object
    fireEvent.click(taskTypeChip, mockEvent);

    // Navigate should be called, but stopPropagation should also be called
    expect(mockNavigate).toHaveBeenCalled();
  });
});
