import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Calendar as CalendarIcon, Clock, Info, Sun, Cloud, Moon } from "lucide-react-native";
import { useState, useEffect } from "react";

export default function DateTimeSelector({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availabilityData,
  isLoadingSlots,
  serviceId,
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [markedDates, setMarkedDates] = useState({});

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Prepare marked dates for calendar
  useEffect(() => {
    const newMarkedDates = {};
    
    // Mark today
    newMarkedDates[today] = {
      ...newMarkedDates[today],
      dotColor: "#C8A882",
      marked: true,
    };
    
    // Mark selected date
    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: "#C8A882",
        selectedTextColor: "#FFFFFF",
      };
    }
    
    // If we have availability data, mark dates with different availability levels
    if (availabilityData && availabilityData.datesWithAvailability) {
      availabilityData.datesWithAvailability.forEach(dateInfo => {
        const date = dateInfo.date;
        const availability = dateInfo.availability;
        
        // Don't override selected date styling
        if (date !== selectedDate) {
          let dotColor = "#22C55E"; // Green for high availability
          if (availability === 'limited') {
            dotColor = "#F59E0B"; // Amber for limited availability
          } else if (availability === 'low') {
            dotColor = "#EF4444"; // Red for low availability
          }
          
          newMarkedDates[date] = {
            ...newMarkedDates[date],
            dotColor,
            marked: true,
          };
        }
      });
    }
    
    setMarkedDates(newMarkedDates);
  }, [selectedDate, availabilityData, today]);

  // Group time slots by time of day
  const groupTimeSlotsByPeriod = (slots) => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    
    slots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0]);
      
      if (hour >= 5 && hour < 12) {
        morning.push(slot);
      } else if (hour >= 12 && hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });
    
    return { morning, afternoon, evening };
  };

  const handleDateSelect = (day) => {
    onDateSelect(day.dateString);
  };

  const handleTimeSelect = (time) => {
    onTimeSelect(time);
  };

  // Render time slots grouped by time of day
  const renderTimeSlots = () => {
    if (isLoadingSlots) {
      return (
        <View>
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Sun size={16} color="#C8A882" />
              <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37", marginLeft: 6 }}>
                Morning
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`morning-${index}`}
                  style={{
                    backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 80,
                    height: 40,
                  }}
                />
              ))}
            </View>
          </View>
          
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Cloud size={16} color="#C8A882" />
              <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37", marginLeft: 6 }}>
                Afternoon
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`afternoon-${index}`}
                  style={{
                    backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 80,
                    height: 40,
                  }}
                />
              ))}
            </View>
          </View>
          
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Moon size={16} color="#C8A882" />
              <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37", marginLeft: 6 }}>
                Evening
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`evening-${index}`}
                  style={{
                    backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 80,
                    height: 40,
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      );
    }
    
    if (availabilityData?.availableSlots?.length > 0) {
      const { morning, afternoon, evening } = groupTimeSlotsByPeriod(availabilityData.availableSlots);
      
      return (
        <View>
          {/* Morning slots */}
          {morning.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Sun size={16} color="#C8A882" />
                <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37", marginLeft: 6 }}>
                  Morning (5AM - 12PM)
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {morning.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeSelect(time)}
                    style={{
                      backgroundColor: selectedTime === time 
                        ? "#C8A882" 
                        : isDark ? "#2A2A2A" : "#F9F5ED",
                      borderWidth: 1,
                      borderColor: selectedTime === time 
                        ? "#C8A882" 
                        : isDark ? "#3A3A3A" : "#E8DCC0",
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 80,
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: selectedTime === time 
                          ? "#FFFFFF" 
                          : isDark ? "#FFFFFF" : "#5D4E37",
                      }}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Afternoon slots */}
          {afternoon.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Cloud size={16} color="#C8A882" />
                <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37", marginLeft: 6 }}>
                  Afternoon (12PM - 5PM)
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {afternoon.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeSelect(time)}
                    style={{
                      backgroundColor: selectedTime === time 
                        ? "#C8A882" 
                        : isDark ? "#2A2A2A" : "#F9F5ED",
                      borderWidth: 1,
                      borderColor: selectedTime === time 
                        ? "#C8A882" 
                        : isDark ? "#3A3A3A" : "#E8DCC0",
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 80,
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: selectedTime === time 
                          ? "#FFFFFF" 
                          : isDark ? "#FFFFFF" : "#5D4E37",
                      }}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Evening slots */}
          {evening.length > 0 && (
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Moon size={16} color="#C8A882" />
                <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37", marginLeft: 6 }}>
                  Evening (5PM - 11PM)
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {evening.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeSelect(time)}
                    style={{
                      backgroundColor: selectedTime === time 
                        ? "#C8A882" 
                        : isDark ? "#2A2A2A" : "#F9F5ED",
                      borderWidth: 1,
                      borderColor: selectedTime === time 
                        ? "#C8A882" 
                        : isDark ? "#3A3A3A" : "#E8DCC0",
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 80,
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: selectedTime === time 
                          ? "#FFFFFF" 
                          : isDark ? "#FFFFFF" : "#5D4E37",
                      }}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      );
    }
    
    // No available slots
    return (
      <View
        style={{
          backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
          borderRadius: 12,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_500Medium",
            color: isDark ? "#9CA3AF" : "#8B7355",
            textAlign: "center",
          }}
        >
          No available time slots for this date
        </Text>
      </View>
    );
  };

  return (
    <>
      {/* Calendar Section */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <CalendarIcon size={20} color="#C8A882" />
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#5D4E37",
              marginLeft: 8,
            }}
          >
            Select Date
          </Text>
        </View>

        {/* Calendar legend */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingHorizontal: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#22C55E", marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: isDark ? "#CCCCCC" : "#8B7355" }}>
              High
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#F59E0B", marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: isDark ? "#CCCCCC" : "#8B7355" }}>
              Limited
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444", marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: isDark ? "#CCCCCC" : "#8B7355" }}>
              Low
            </Text>
          </View>
        </View>

        <Calendar
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          minDate={today}
          maxDate={maxDateString}
          theme={{
            backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
            calendarBackground: isDark ? "#2A2A2A" : "#F9F5ED",
            textSectionTitleColor: isDark ? "#FFFFFF" : "#5D4E37",
            dayTextColor: isDark ? "#FFFFFF" : "#5D4E37",
            todayTextColor: "#C8A882",
            selectedDayBackgroundColor: "#C8A882",
            selectedDayTextColor: "#FFFFFF",
            monthTextColor: isDark ? "#FFFFFF" : "#5D4E37",
            arrowColor: "#C8A882",
            textDisabledColor: isDark ? "#666666" : "#D0C4A8",
            dotColor: "#C8A882",
            markedDayColor: "#C8A882",
          }}
          style={{
            borderRadius: 12,
            backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
            paddingVertical: 10,
          }}
          // Add custom day component to enhance visual feedback
          dayComponent={({ date, state }) => {
            const isSelected = selectedDate === date.dateString;
            const isToday = today === date.dateString;
            const dateInfo = markedDates[date.dateString] || {};
            
            return (
              <TouchableOpacity
                style={[
                  {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: 2,
                  },
                  isSelected && {
                    backgroundColor: "#C8A882",
                  },
                  isToday && !isSelected && {
                    borderWidth: 1,
                    borderColor: "#C8A882",
                  }
                ]}
                onPress={() => handleDateSelect({ dateString: date.dateString })}
                disabled={state === "disabled"}
              >
                <Text
                  style={[
                    {
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: state === "disabled" 
                        ? (isDark ? "#666666" : "#D0C4A8") 
                        : isSelected 
                          ? "#FFFFFF" 
                          : isDark ? "#FFFFFF" : "#5D4E37",
                    },
                    isToday && !isSelected && {
                      color: "#C8A882",
                    }
                  ]}
                >
                  {date.day}
                </Text>
                
                {/* Add dot indicator for availability */}
                {dateInfo.marked && !isSelected && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: dateInfo.dotColor || "#C8A882",
                      position: "absolute",
                      bottom: 4,
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
        
        {/* Calendar info tip */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, paddingHorizontal: 4 }}>
          <Info size={14} color={isDark ? "#9CA3AF" : "#8B7355"} />
          <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: isDark ? "#9CA3AF" : "#8B7355", marginLeft: 4 }}>
            Select a date to view available time slots
          </Text>
        </View>
      </View>

      {/* Time Slots Section */}
      {selectedDate && (
        <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Clock size={20} color="#C8A882" />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#5D4E37",
                marginLeft: 8,
              }}
            >
              Available Times
            </Text>
          </View>

          {renderTimeSlots()}
        </View>
      )}
    </>
  );
}