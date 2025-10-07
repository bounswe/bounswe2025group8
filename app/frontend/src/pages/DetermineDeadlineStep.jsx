import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  isSameDay,
} from "date-fns";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { updateFormData } from "../features/request/store/createRequestSlice";
import { deserializeDate, serializeDate } from "../utils/dateUtils";

const DetermineDeadlineStep = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    deserializeDate(formData.deadlineDate)
  );
  const [selectedTime, setSelectedTime] = useState(formData.deadlineTime);

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Serialize the date before dispatching to Redux
    dispatch(updateFormData({ deadlineDate: serializeDate(date) }));
  };

  // Handle time selection
  const handleTimeChange = (time) => {
    const formattedTime = format(time, "hh:mm a");
    setSelectedTime(formattedTime);
    dispatch(updateFormData({ deadlineTime: formattedTime }));
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Render calendar
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const dayOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Create day cells for the current month
    const dayCells = days.map((date) => {
      const dayNum = getDay(date);
      // Adjust day number to match the UI (Monday as the first day)
      const adjustedDayNum = dayNum === 0 ? 6 : dayNum - 1;

      return {
        date,
        dayOfWeek: adjustedDayNum,
      };
    });

    // Group by weeks
    const weeks = [];
    let currentWeek = [];

    dayCells.forEach((cell) => {
      if (
        currentWeek.length === 0 ||
        cell.dayOfWeek > currentWeek[currentWeek.length - 1].dayOfWeek
      ) {
        currentWeek.push(cell);
      } else {
        weeks.push(currentWeek);
        currentWeek = [cell];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <table className="w-full">
          <thead>
            <tr>
              {dayOfWeek.map((day) => (
                <th
                  key={day}
                  className="py-2 text-center text-sm font-medium text-gray-700"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => {
              const fullWeek = [];

              // Fill in empty cells for days before the first day of the week
              if (weekIndex === 0) {
                const firstDayOfWeek = week[0].dayOfWeek;
                for (let i = 0; i < firstDayOfWeek; i++) {
                  fullWeek.push({ empty: true, dayOfWeek: i });
                }
              }

              // Add actual days
              week.forEach((cell) => {
                fullWeek.push(cell);
              });

              // Fill in empty cells for days after the last day of the week
              const lastDayOfWeek = fullWeek[fullWeek.length - 1].dayOfWeek;
              for (let i = lastDayOfWeek + 1; i < 7; i++) {
                fullWeek.push({ empty: true, dayOfWeek: i });
              }

              return (
                <tr key={`week-${weekIndex}`}>
                  {fullWeek.map((cell, cellIndex) => (
                    <td
                      key={`cell-${cellIndex}`}
                      className={`py-2 text-center cursor-pointer ${
                        cell.empty ? "opacity-30" : ""
                      } ${
                        cell.date && isToday(cell.date)
                          ? "font-bold text-blue-600"
                          : ""
                      } ${
                        cell.date && isSameDay(cell.date, selectedDate)
                          ? "bg-blue-600 text-white font-bold rounded-full w-9 h-9 mx-auto flex items-center justify-center"
                          : ""
                      }`}
                      onClick={() => {
                        if (!cell.empty) {
                          handleDateChange(cell.date);
                        }
                      }}
                    >
                      <div
                        className={
                          cell.date && isSameDay(cell.date, selectedDate)
                            ? ""
                            : "w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full"
                        }
                      >
                        {cell.empty ? "" : format(cell.date, "d")}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        {/* Date selection */}
        <div>
          <h3 className="text-sm font-bold mb-2">Select Date</h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </h2>

              <div className="flex">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowBackIosIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </button>
              </div>
            </div>

            {renderCalendar()}
          </div>
        </div>

        {/* Time selection */}
        <div>
          <h3 className="text-sm font-bold mb-2">Select Time</h3>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              value={(() => {
                try {
                  // Safely parse time string
                  return new Date(`2025-01-01 ${selectedTime}`);
                } catch (error) {
                  console.error("Invalid time format:", error);
                  return new Date();
                }
              })()}
              onChange={handleTimeChange}
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  size: "medium",
                  className: "w-full",
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
    </div>
  );
};

export default DetermineDeadlineStep;
