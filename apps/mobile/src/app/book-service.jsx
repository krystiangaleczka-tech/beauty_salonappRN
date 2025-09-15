import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Calendar as CalendarIcon, Clock } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import { Formik } from "formik";
import * as Yup from "yup";

export default function BookServiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { service_id, service_name } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Date/Time, 2: Form, 3: Confirmation
  const [bookingDetails, setBookingDetails] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Get available time slots for selected date
  const { data: availabilityData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', selectedDate, service_id],
    queryFn: async () => {
      if (!selectedDate) return { availableSlots: [] };
      const response = await fetch(`/api/calendar/availability?date=${selectedDate}&service_id=${service_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json();
    },
    enabled: !!selectedDate,
  });

  // Get service details
  const { data: serviceData } = useQuery({
    queryKey: ['service', service_id],
    queryFn: async () => {
      if (!service_id) return null;
      const response = await fetch(`/api/services/${service_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }
      return response.json();
    },
    enabled: !!service_id,
  });

  // Book appointment mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book appointment');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['bookings']);
      setBookingDetails(data.booking);
      setCurrentStep(3); // Move to confirmation step
    },
    onError: (error) => {
      Alert.alert('Booking Failed', error.message);
    },
  });
  
  // Validation schema for booking form
  const BookingSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    notes: Yup.string(),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleDateTimeSelection = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both date and time');
      return;
    }
    setCurrentStep(2); // Move to form step
  };

  const handleBookAppointment = (values) => {
    bookingMutation.mutate({
      service_id: parseInt(service_id),
      booking_date: selectedDate,
      start_time: selectedTime,
      notes: values.notes,
      user_info: {
        name: values.name,
        email: values.email,
        phone: values.phone
      }
    });
  };
  
  const handleBackToServices = () => {
    router.push('/(tabs)/services');
  };
  
  const handleViewBookings = () => {
    router.push('/(tabs)/bookings');
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Render step indicators
  const renderStepIndicators = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 }}>
      {[1, 2, 3].map((step) => (
        <View 
          key={step}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View 
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: currentStep >= step ? '#C8A882' : isDark ? '#2A2A2A' : '#F9F5ED',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#C8A882',
            }}
          >
            <Text 
              style={{
                color: currentStep >= step ? '#FFFFFF' : isDark ? '#FFFFFF' : '#5D4E37',
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
              }}
            >
              {step}
            </Text>
          </View>
          
          {step < 3 && (
            <View 
              style={{
                height: 2, 
                width: 20, 
                backgroundColor: currentStep > step ? '#C8A882' : isDark ? '#2A2A2A' : '#F9F5ED',
              }}
            />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FDF8F0" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top,
            paddingHorizontal: 20,
            paddingBottom: 12,
            backgroundColor: isDark ? "#121212" : "#FDF8F0",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#333333" : "#E8DCC0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 44,
            }}
          >
            <TouchableOpacity
              onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <ChevronLeft size={20} color={isDark ? "#FFFFFF" : "#5D4E37"} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#5D4E37",
                marginLeft: 8,
              }}
            >
              {currentStep === 3 ? 'Booking Confirmation' : `Book ${service_name}`}
            </Text>
          </View>
        </View>
        
        {/* Step indicators */}
        {renderStepIndicators()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && (
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

              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: "#C8A882",
                  },
                }}
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
                }}
                style={{
                  borderRadius: 12,
                  backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                  paddingVertical: 10,
                }}
              />
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

                {isLoadingSlots ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <View
                        key={index}
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
                ) : availabilityData?.availableSlots?.length > 0 ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {availabilityData.availableSlots.map((time) => (
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
                ) : (
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
                )}
              </View>
            )}
          </>
        )}
        
        {currentStep === 2 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#5D4E37",
                  marginBottom: 8,
                }}
              >
                Booking Details
              </Text>
              
              <View 
                style={{
                  backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    Service:
                  </Text>
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    {service_name}
                  </Text>
                </View>
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    Date:
                  </Text>
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    {new Date(selectedDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    Time:
                  </Text>
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    {selectedTime}
                  </Text>
                </View>
                
                {serviceData?.service && (
                  <>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                        Duration:
                      </Text>
                      <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                        {serviceData.service.duration_minutes} minutes
                      </Text>
                    </View>
                    
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                        Price:
                      </Text>
                      <Text style={{ fontFamily: "Inter_600SemiBold", color: "#E91E63" }}>
                        ${parseFloat(serviceData.service.price).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
            
            <Formik
              initialValues={{ name: '', email: '', phone: '', notes: '' }}
              validationSchema={BookingSchema}
              onSubmit={handleBookAppointment}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Inter_600SemiBold",
                      color: isDark ? "#FFFFFF" : "#5D4E37",
                      marginBottom: 16,
                    }}
                  >
                    Your Information
                  </Text>
                  
                  {/* Name Field */}
                  <View style={{ marginBottom: 16 }}>
                    <Text 
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                        marginBottom: 8,
                      }}
                    >
                      Full Name
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: errors.name && touched.name ? "#EF4444" : isDark ? "#333333" : "#E8DCC0",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                      }}
                      placeholder="Enter your full name"
                      placeholderTextColor={isDark ? "#666666" : "#D0C4A8"}
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                    />
                    {errors.name && touched.name && (
                      <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.name}</Text>
                    )}
                  </View>
                  
                  {/* Email Field */}
                  <View style={{ marginBottom: 16 }}>
                    <Text 
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                        marginBottom: 8,
                      }}
                    >
                      Email
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: errors.email && touched.email ? "#EF4444" : isDark ? "#333333" : "#E8DCC0",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor={isDark ? "#666666" : "#D0C4A8"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                    />
                    {errors.email && touched.email && (
                      <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.email}</Text>
                    )}
                  </View>
                  
                  {/* Phone Field */}
                  <View style={{ marginBottom: 16 }}>
                    <Text 
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                        marginBottom: 8,
                      }}
                    >
                      Phone Number
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: errors.phone && touched.phone ? "#EF4444" : isDark ? "#333333" : "#E8DCC0",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                      }}
                      placeholder="Enter your phone number"
                      placeholderTextColor={isDark ? "#666666" : "#D0C4A8"}
                      keyboardType="phone-pad"
                      value={values.phone}
                      onChangeText={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                    />
                    {errors.phone && touched.phone && (
                      <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.phone}</Text>
                    )}
                  </View>
                  
                  {/* Notes Field */}
                  <View style={{ marginBottom: 16 }}>
                    <Text 
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                        marginBottom: 8,
                      }}
                    >
                      Notes (Optional)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                        borderWidth: 1,
                        borderColor: isDark ? "#333333" : "#E8DCC0",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#FFFFFF" : "#5D4E37",
                        height: 100,
                        textAlignVertical: "top",
                      }}
                      placeholder="Any special requests or information"
                      placeholderTextColor={isDark ? "#666666" : "#D0C4A8"}
                      multiline
                      numberOfLines={4}
                      value={values.notes}
                      onChangeText={handleChange('notes')}
                      onBlur={handleBlur('notes')}
                    />
                  </View>
                  
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={bookingMutation.isPending}
                    style={{
                      backgroundColor: bookingMutation.isPending ? "#A0927A" : "#C8A882",
                      borderRadius: 12,
                      minHeight: 56,
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 16,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color: "#FFFFFF",
                      }}
                    >
                      {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        )}
        
        {currentStep === 3 && bookingDetails && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' }}>
            <View 
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#22C55E",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 40 }}>✓</Text>
            </View>
            
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#5D4E37",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Booking Confirmed!
            </Text>
            
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#CCCCCC" : "#8B7355",
                marginBottom: 32,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Your appointment has been successfully booked. You'll receive a confirmation email shortly.
            </Text>
            
            <View 
              style={{
                backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                borderRadius: 12,
                padding: 20,
                width: "100%",
                marginBottom: 32,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#5D4E37",
                  marginBottom: 16,
                }}
              >
                Appointment Details
              </Text>
              
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#CCCCCC" : "#8B7355", marginBottom: 4 }}>
                  Service
                </Text>
                <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37", fontSize: 16 }}>
                  {service_name}
                </Text>
              </View>
              
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#CCCCCC" : "#8B7355", marginBottom: 4 }}>
                  Date & Time
                </Text>
                <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37", fontSize: 16 }}>
                  {new Date(bookingDetails.booking_date).toLocaleDateString()} at {bookingDetails.start_time}
                </Text>
              </View>
              
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#CCCCCC" : "#8B7355", marginBottom: 4 }}>
                  Booking ID
                </Text>
                <Text style={{ fontFamily: "Inter_600SemiBold", color: isDark ? "#FFFFFF" : "#5D4E37", fontSize: 16 }}>
                  #{bookingDetails.id}
                </Text>
              </View>
              
              {bookingDetails.notes && (
                <View>
                  <Text style={{ fontFamily: "Inter_500Medium", color: isDark ? "#CCCCCC" : "#8B7355", marginBottom: 4 }}>
                    Notes
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", color: isDark ? "#FFFFFF" : "#5D4E37" }}>
                    {bookingDetails.notes}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <TouchableOpacity
                onPress={handleViewBookings}
                style={{
                  flex: 1,
                  backgroundColor: "#C8A882",
                  borderRadius: 12,
                  minHeight: 56,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  View Bookings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleBackToServices}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "#2A2A2A" : "#F9F5ED",
                  borderWidth: 1,
                  borderColor: "#C8A882",
                  borderRadius: 12,
                  minHeight: 56,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#C8A882",
                  }}
                >
                  Book Another
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button for Step 1 */}
      {currentStep === 1 && selectedDate && selectedTime && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? "#121212" : "#FDF8F0",
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#333333" : "#E8DCC0",
          }}
        >
          <TouchableOpacity
            onPress={handleDateTimeSelection}
            style={{
              backgroundColor: "#C8A882",
              borderRadius: 12,
              minHeight: 56,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </KeyboardAvoidingView>
  );
}