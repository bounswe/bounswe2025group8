import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
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
import { useTheme } from "../hooks/useTheme";

const DetermineDeadlineStep = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
  }, [
    buildDeadlineDateTime,
    dispatch,
    minDeadline,
    selectedDate,
    selectedTime,
  ]);

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

    const dayOfWeek = [
      t("determineDeadlineStep.monday"),
      t("determineDeadlineStep.tuesday"),
      t("determineDeadlineStep.wednesday"),
      t("determineDeadlineStep.thursday"),
      t("determineDeadlineStep.friday"),
      t("determineDeadlineStep.saturday"),
      t("determineDeadlineStep.sunday"),
    ];
    const minSelectableDate = startOfDay(minDeadline);

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div
        className="rounded-lg border mb-6"
        style={{
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.primary,
        }}
        role="group"
        aria-label={t("determineDeadlineStep.calendarFor", {
          month: format(currentMonth, "MMMM yyyy"),
        })}
      >
        <table className="w-full" aria-labelledby="calendar-caption">
          <caption id="calendar-caption" className="sr-only">
            {format(currentMonth, "MMMM yyyy")}
          </caption>
          <thead>
            <tr>
              {dayOfWeek.map((day) => (
                <th
                  key={day}
                  className="py-2 text-center text-sm font-medium"
                  style={{ color: colors.text.primary }}
                  scope="col"
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
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const innerClasses = [
                      "w-9 h-9 flex items-center justify-center rounded-full mx-auto",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const getCellStyle = () => {
                      if (isOutsideMonth)
                        return { color: colors.text.tertiary };
                      if (!isClickable && !isSelected)
                        return { color: colors.text.tertiary };
                      if (isTodayCell)
                        return {
                          color: colors.brand.primary,
                          fontWeight: "bold",
                        };
                      return { color: colors.text.primary };
                    };

                    const getInnerStyle = () => {
                      if (isSelected)
                        return {
                          backgroundColor: colors.brand.primary,
                          color: colors.text.inverse,
                          fontWeight: "bold",
                        };
                      return {};
                    };

                    return (
                      <td
                        key={`cell-${cellIndex}`}
                        className={cellClasses}
                        style={getCellStyle()}
                      >
                        <div
                          className={innerClasses}
                          style={getInnerStyle()}
                          role={isClickable ? "button" : undefined}
                          aria-disabled={!isClickable}
                          aria-pressed={isSelected}
                          tabIndex={isClickable ? 0 : -1}
                          aria-label={`${format(date, "MMMM d, yyyy")}${
                            isSelected
                              ? `, ${t("determineDeadlineStep.selected")}`
                              : ""
                          }${
                            isTodayCell
                              ? `, ${t("determineDeadlineStep.today")}`
                              : ""
                          }${
                            !isClickable
                              ? `, ${t("determineDeadlineStep.unavailable")}`
                              : ""
                          }`}
                          onClick={() => {
                            if (isClickable) {
                              handleDateChange(date);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              (e.key === "Enter" || e.key === " ") &&
                              isClickable
                            ) {
                              e.preventDefault();
                              handleDateChange(date);
                            }
                          }}
                          onMouseOver={(e) => {
                            if (isClickable && !isSelected) {
                              e.currentTarget.style.backgroundColor =
                                colors.background.tertiary;
                            }
                          }}
                          onMouseOut={(e) => {
                            if (isClickable && !isSelected) {
                              e.currentTarget.style.backgroundColor = "";
                            }
                          }}
                        >
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
          <h3
            className="text-sm font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            {t("determineDeadlineStep.selectDate")}
          </h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-lg font-medium"
                style={{ color: colors.text.primary }}
              >
                {format(currentMonth, "MMMM yyyy")}
              </h2>

              <div className="flex">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary,
                  }}
                  aria-label={t("determineDeadlineStep.previousMonth")}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background.tertiary)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background.secondary)
                  }
                >
                  <ArrowBackIosIcon fontSize="small" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary,
                  }}
                  aria-label={t("determineDeadlineStep.nextMonth")}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background.tertiary)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background.secondary)
                  }
                >
                  <ArrowForwardIosIcon fontSize="small" aria-hidden="true" />
                </button>
              </div>
            </div>

            {renderCalendar()}
          </div>
        </div>

        {/* Time selection */}
        <div>
          <h3
            className="text-sm font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            {t("determineDeadlineStep.selectTime")}
          </h3>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              value={timePickerValue}
              minTime={minTimeValue}
              onChange={handleTimeChange}
              referenceDate={effectiveSelectedDate}
              slotProps={{
                textField: {
                  label: t("determineDeadlineStep.selectTimeLabel"),
                  variant: "outlined",
                  fullWidth: true,
                  size: "medium",
                  className: "w-full",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      "& fieldset": {
                        borderColor: colors.border.primary,
                      },
                      "&:hover fieldset": {
                        borderColor: colors.brand.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.brand.primary,
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: colors.text.primary,
                    },
                    "& .MuiIconButton-root": {
                      color: colors.brand.primary,
                    },
                  },
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
