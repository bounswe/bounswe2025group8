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
  startOfWeek,
  endOfWeek,
  isToday,
  getDay,
  isSameDay,
  parse,
  addMinutes,
  isBefore,
  startOfDay,
  isSameMonth,
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
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const dayOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const minSelectableDate = startOfDay(minDeadline);

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
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
              return (
                <tr key={`week-${weekIndex}`}>
                  {week.map((date, cellIndex) => {
                    const isSelected = selectedDate
                      ? isSameDay(date, selectedDate)
                      : false;
                    const isOutsideMonth = !isSameMonth(date, monthStart);
                    const isBeforeMin = isBefore(date, minSelectableDate);
                    const isDisabled = isOutsideMonth || isBeforeMin;
                    const isClickable = !isDisabled;
                    const isTodayCell = isToday(date) && !isSelected;

                    const cellClasses = [
                      "py-2 text-center align-middle",
                      isClickable ? "cursor-pointer" : "cursor-not-allowed",
                      isOutsideMonth ? "text-gray-300" : "",
                      !isClickable && !isOutsideMonth && !isSelected
                        ? "text-gray-300"
                        : "",
                      isTodayCell ? "font-bold text-blue-600" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const innerClasses = [
                      "w-9 h-9 flex items-center justify-center rounded-full mx-auto",
                      isSelected ? "bg-blue-600 text-white font-bold" : "",
                      !isSelected && isTodayCell && !isOutsideMonth
                        ? "font-bold text-blue-600"
                        : "",
                      !isSelected && isClickable ? "hover:bg-gray-100" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <td
                        key={`cell-${cellIndex}`}
                        className={cellClasses}
                        onClick={() => {
                          if (isClickable) {
                            handleDateChange(date);
                          }
                        }}
                      >
                        <div className={innerClasses}>
                          {format(date, "d")}
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
