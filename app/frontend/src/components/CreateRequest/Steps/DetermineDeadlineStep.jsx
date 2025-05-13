import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LocalizationProvider, DateCalendar, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, isSameDay } from 'date-fns';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { updateFormData } from '../../../store/slices/createRequestSlice';

const DetermineDeadlineStep = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date(formData.deadlineDate));
  const [selectedTime, setSelectedTime] = useState(formData.deadlineTime);
  
  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    dispatch(updateFormData({ deadlineDate: date }));
  };
  
  // Handle time selection
  const handleTimeChange = (time) => {
    const formattedTime = format(time, 'hh:mm a');
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
    
    const dayOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
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
      if (currentWeek.length === 0 || cell.dayOfWeek > currentWeek[currentWeek.length - 1].dayOfWeek) {
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
      <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {dayOfWeek.map((day) => (
                <TableCell key={day} align="center" sx={{ py: 1 }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
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
                <TableRow key={`week-${weekIndex}`}>
                  {fullWeek.map((cell, cellIndex) => (
                    <TableCell 
                      key={`cell-${cellIndex}`} 
                      align="center"
                      sx={{
                        py: 1,
                        ...(cell.empty 
                          ? { opacity: 0.3 } 
                          : {}),
                        ...(cell.date && isToday(cell.date) 
                          ? { fontWeight: 'bold', color: 'primary.main' } 
                          : {}),
                        ...(cell.date && isSameDay(cell.date, selectedDate) 
                          ? { 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              borderRadius: '50%',
                              width: 36,
                              height: 36,
                              fontWeight: 'bold',
                            } 
                          : {}),
                        cursor: cell.empty ? 'default' : 'pointer',
                      }}
                      onClick={() => {
                        if (!cell.empty) {
                          handleDateChange(cell.date);
                        }
                      }}
                    >
                      {cell.empty ? '' : format(cell.date, 'd')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Date selection */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select Date
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              
              <Box>
                <IconButton onClick={prevMonth}>
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={nextMonth}>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {renderCalendar()}
          </Box>
        </Grid>
        
        {/* Time selection */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select Time
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              value={new Date(`2025-01-01 ${selectedTime}`)}
              onChange={handleTimeChange}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  variant="outlined" 
                />
              )}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  size: 'medium',
                },
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetermineDeadlineStep;