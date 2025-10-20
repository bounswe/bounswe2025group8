import React, { useCallback, useEffect, useState } from "react";
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
  parse,
  addMinutes,
  isBefore,
  startOfDay,
} from "date-fns";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { updateFormData } from "../features/request/store/createRequestSlice";
import { deserializeDate } from "../utils/dateUtils";

const DetermineDeadlineStep = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);

  const [minDeadline, setMinDeadline] = useState(() =>
    addMinutes(new Date(), 10)
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    deserializeDate(formData.deadlineDate)
  );
  const [selectedTime, setSelectedTime] = useState(
    formData.deadlineTime || null
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMinDeadline(addMinutes(new Date(), 10));
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const buildDeadlineDateTime = useCallback((date, timeString) => {
    if (!date) return null;

    try {
      const baseDate = new Date(date);
      if (Number.isNaN(baseDate.getTime())) {
        return null;
      }

      if (!timeString) {
        return baseDate;
      }

      const parsedTime = parse(timeString, "hh:mm a", baseDate);
      if (Number.isNaN(parsedTime.getTime())) {
        return baseDate;
      }

      return parsedTime;
    } catch (error) {
      console.error("Failed to build deadline datetime:", error);
      return null;
    }
  }, []);

  const updateDeadlineInStore = useCallback(
    (date, timeString) => {
      const combined = buildDeadlineDateTime(date, timeString);
      if (combined) {
        dispatch(updateFormData({ deadlineDate: combined.toISOString() }));
      }
    },
    [dispatch, buildDeadlineDateTime]
  );

  useEffect(() => {
    const combined = buildDeadlineDateTime(selectedDate, selectedTime);
    if (!combined || isBefore(combined, minDeadline)) {
      const adjustedDate = new Date(minDeadline);
      if (!selectedDate || selectedDate.getTime() !== adjustedDate.getTime()) {
        setSelectedDate(adjustedDate);
        setCurrentMonth(adjustedDate);
      }

      const adjustedTime = format(adjustedDate, "hh:mm a");
      if (selectedTime !== adjustedTime) {
        setSelectedTime(adjustedTime);
        dispatch(updateFormData({ deadlineTime: adjustedTime }));
      }
    }
  }, [buildDeadlineDateTime, dispatch, minDeadline, selectedDate, selectedTime]);

  // Handle date selection
  const handleDateChange = (date) => {
    if (!date) {
      return;
    }

    const minSelectableDate = startOfDay(minDeadline);
    if (isBefore(date, minSelectableDate)) {
      return;
    }

    if (isSameDay(date, minDeadline)) {
      const combined = buildDeadlineDateTime(date, selectedTime);
      if (!combined || isBefore(combined, minDeadline)) {
        const adjustedTime = format(minDeadline, "hh:mm a");
        if (selectedTime !== adjustedTime) {
          setSelectedTime(adjustedTime);
          dispatch(updateFormData({ deadlineTime: adjustedTime }));
        }
      }
    }

    setSelectedDate(date);
    setCurrentMonth(date);
  };

  // Handle time selection
  const handleTimeChange = (time) => {
    if (!time) {
      return;
    }

    const formattedTime = format(time, "hh:mm a");
    const baseDate = selectedDate || minDeadline;
    const combined = buildDeadlineDateTime(baseDate, formattedTime);

    if (combined && isBefore(combined, minDeadline)) {
      const adjustedDate = new Date(minDeadline);
      const adjustedTime = format(adjustedDate, "hh:mm a");
      setSelectedDate(adjustedDate);
      setCurrentMonth(adjustedDate);
      if (selectedTime !== adjustedTime) {
        setSelectedTime(adjustedTime);
        dispatch(updateFormData({ deadlineTime: adjustedTime }));
      }
      return;
    }

    if (!selectedDate) {
      const clonedDate = new Date(baseDate);
      setSelectedDate(clonedDate);
      setCurrentMonth(clonedDate);
    }

    setSelectedTime(formattedTime);
    dispatch(updateFormData({ deadlineTime: formattedTime }));
  };

  useEffect(() => {
    updateDeadlineInStore(selectedDate, selectedTime);
  }, [selectedDate, selectedTime, updateDeadlineInStore]);

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
    const minSelectableDate = startOfDay(minDeadline);

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
                  {fullWeek.map((cell, cellIndex) => {
                    const isSelected =
                      cell.date && selectedDate
                        ? isSameDay(cell.date, selectedDate)
                        : false;
                    const isDisabled =
                      cell.empty ||
                      (cell.date
                        ? isBefore(cell.date, minSelectableDate)
                        : true);
                    const isClickable = !isDisabled && !!cell.date;
                    const isTodayCell =
                      cell.date && isToday(cell.date) && !isSelected;

                    const cellClasses = [
                      "py-2 text-center",
                      isClickable ? "cursor-pointer" : "cursor-not-allowed",
                      cell.empty ? "opacity-30" : "",
                      !isClickable && !cell.empty && !isSelected
                        ? "text-gray-300"
                        : "",
                      isTodayCell ? "font-bold text-blue-600" : "",
                      isSelected
                        ? "bg-blue-600 text-white font-bold rounded-full w-9 h-9 mx-auto flex items-center justify-center"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const innerClasses = isSelected
                      ? ""
                      : [
                          "w-9 h-9 flex items-center justify-center rounded-full",
                          isClickable ? "hover:bg-gray-100" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                    return (
                      <td
                        key={`cell-${cellIndex}`}
                        className={cellClasses}
                        onClick={() => {
                          if (isClickable && cell.date) {
                            handleDateChange(cell.date);
                          }
                        }}
                      >
                        <div className={innerClasses}>
                          {cell.empty ? "" : format(cell.date, "d")}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const effectiveSelectedDate = selectedDate || minDeadline;
  const computedTimeString =
    selectedTime || format(effectiveSelectedDate, "hh:mm a");
  const timePickerValue =
    buildDeadlineDateTime(effectiveSelectedDate, computedTimeString) ||
    new Date(effectiveSelectedDate);
  const minTimeValue = isSameDay(effectiveSelectedDate, minDeadline)
    ? new Date(minDeadline)
    : startOfDay(effectiveSelectedDate);

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
              value={timePickerValue}
              minTime={minTimeValue}
              onChange={handleTimeChange}
              referenceDate={effectiveSelectedDate}
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
