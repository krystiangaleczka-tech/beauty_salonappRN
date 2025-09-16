import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  CheckCircle,
  Sun,
  Cloud,
  Moon,
  Info
} from 'lucide-react';

// Validation schema for booking form
const BookingSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  notes: Yup.string(),
});

// Time slot component
const TimeSlot = ({ time, isSelected, onSelect, isDark }) => (
  <button
    type="button"
    onClick={() => onSelect(time)}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isSelected
        ? 'bg-[#C8A882] text-white'
        : isDark
        ? 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
        : 'bg-[#F9F5ED] text-[#5D4E37] hover:bg-[#E8DCC0]'
    }`}
  >
    {time}
  </button>
);

// Time slots grouped by period component
const TimeSlotsGroup = ({ title, icon: Icon, slots, selectedTime, onSelect, isDark }) => (
  <div className="mb-6">
    <div className="flex items-center mb-3">
      <Icon size={16} className="text-[#C8A882]" />
      <span className="text-sm font-medium text-[#5D4E37] ml-2">{title}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {slots.map((time) => (
        <TimeSlot
          key={time}
          time={time}
          isSelected={selectedTime === time}
          onSelect={onSelect}
          isDark={isDark}
        />
      ))}
    </div>
  </div>
);

// Calendar component
const CustomCalendar = ({ selectedDate, onDateSelect, markedDates, isDark }) => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days from now

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDate === dateStr;
    const isToday = date.toDateString() === today.toDateString();
    const dateInfo = markedDates[dateStr] || {};
    
    let classes = '';
    
    if (isSelected) {
      classes += ' bg-[#C8A882] text-white rounded-full';
    } else if (isToday) {
      classes += ' border-2 border-[#C8A882] rounded-full';
    }
    
    return classes;
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const dateInfo = markedDates[dateStr] || {};
    
    if (dateInfo.marked && selectedDate !== dateStr) {
      return (
        <div
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ backgroundColor: dateInfo.dotColor || '#C8A882' }}
        />
      );
    }
    
    return null;
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      backgroundColor: isDark ? '#2A2A2A' : '#F9F5ED',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #E8DCC0'
    }}>
      <Calendar
        onChange={onDateSelect}
        value={selectedDate ? new Date(selectedDate) : null}
        minDate={today}
        maxDate={maxDate}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="react-calendar"
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );
};

export default function BookServicePage() {
  const [searchParams] = useSearchParams();
  const service_id = searchParams.get('service_id');
  const service_name = searchParams.get('service_name');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Date/Time, 2: Form, 3: Confirmation
  const [bookingDetails, setBookingDetails] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [isDark, setIsDark] = useState(false);

  // Get available time slots for selected date
  const { data: availabilityData, isLoading: isLoadingSlots, error: availabilityError } = useQuery({
    queryKey: ['availability', selectedDate, service_id],
    queryFn: async () => {
      if (!selectedDate) return { availableSlots: [] };
      const response = await fetch(`/api/calendar/availability?date=${selectedDate}&service_id=${service_id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch availability');
      }
      return response.json();
    },
    enabled: !!selectedDate,
    retry: 1,
  });

  // Prepare marked dates for calendar
  useEffect(() => {
    const newMarkedDates = {};
    
    // Today
    const today = new Date().toISOString().split('T')[0];
    newMarkedDates[today] = {
      ...newMarkedDates[today],
      dotColor: "#C8A882",
      marked: true,
    };
    
    // Selected date
    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
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
  }, [selectedDate, availabilityData]);

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
      alert('Booking Failed: ' + error.message);
    },
  });

  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleDateTimeSelection = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
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
    navigate('/client');
  };
  
  const handleViewBookings = () => {
    navigate('/client');
  };

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

  // Render step indicators
  const renderStepIndicators = () => (
    <div className="flex justify-center py-4">
      {[1, 2, 3].map((step) => (
        <div 
          key={step}
          className="flex items-center"
        >
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= step 
                ? 'bg-[#C8A882] text-white' 
                : 'bg-[#F9F5ED] text-[#5D4E37] border border-[#C8A882]'
            }`}
          >
            {step}
          </div>
          
          {step < 3 && (
            <div 
              className={`h-0.5 w-5 ${
                currentStep > step ? 'bg-[#C8A882]' : 'bg-[#F9F5ED]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render time slots
  const renderTimeSlots = () => {
    if (isLoadingSlots) {
      return (
        <div className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`morning-${index}`} className="h-10 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`afternoon-${index}`} className="h-10 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`evening-${index}`} className="h-10 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (availabilityData?.availableSlots?.length > 0) {
      const { morning, afternoon, evening } = groupTimeSlotsByPeriod(availabilityData.availableSlots);
      
      return (
        <div>
          {morning.length > 0 && (
            <TimeSlotsGroup
              title="Morning (5AM - 12PM)"
              icon={Sun}
              slots={morning}
              selectedTime={selectedTime}
              onSelect={handleTimeSelect}
              isDark={isDark}
            />
          )}
          
          {afternoon.length > 0 && (
            <TimeSlotsGroup
              title="Afternoon (12PM - 5PM)"
              icon={Cloud}
              slots={afternoon}
              selectedTime={selectedTime}
              onSelect={handleTimeSelect}
              isDark={isDark}
            />
          )}
          
          {evening.length > 0 && (
            <TimeSlotsGroup
              title="Evening (5PM - 11PM)"
              icon={Moon}
              slots={evening}
              selectedTime={selectedTime}
              onSelect={handleTimeSelect}
              isDark={isDark}
            />
          )}
        </div>
      );
    }
    
    // No available slots
    return (
      <div className={`rounded-xl p-5 text-center ${isDark ? 'bg-[#2A2A2A]' : 'bg-[#F9F5ED]'}`}>
        <p className={`text-base ${isDark ? 'text-[#9CA3AF]' : 'text-[#8B7355]'}`}>
          No available time slots for this date
        </p>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#121212]' : 'bg-[#FDF8F0]'}`}>
      {/* Header */}
      <header className={`pt-6 px-6 pb-4 ${isDark ? 'bg-[#121212]' : 'bg-[#FDF8F0]'} border-b ${isDark ? 'border-[#333333]' : 'border-[#E8DCC0]'}`}>
        <div className="flex items-center h-12">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={20} className={isDark ? "text-white" : "text-[#5D4E37]"} />
          </button>
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} ml-2`}>
            {currentStep === 3 ? 'Booking Confirmation' : `Book ${service_name}`}
          </h1>
        </div>
      </header>
      
      {/* Step indicators */}
      {renderStepIndicators()}

      <div className="px-6 py-6">
        {currentStep === 1 && (
          <div>
            {/* Calendar Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CalendarIcon size={20} className="text-[#C8A882]" />
                <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} ml-2`}>
                  Select Date
                </h2>
              </div>

              {/* Calendar legend */}
              <div className="flex justify-between mb-4 px-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E] mr-2" />
                  <span className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-[#8B7355]'}`}>High</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2" />
                  <span className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-[#8B7355]'}`}>Limited</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] mr-2" />
                  <span className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-[#8B7355]'}`}>Low</span>
                </div>
              </div>

              <CustomCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                markedDates={markedDates}
                isDark={isDark}
              />
              
              <div className="flex items-center mt-3 px-1">
                <Info size={14} className={isDark ? "text-[#9CA3AF]" : "text-[#8B7355]"} />
                <span className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-[#8B7355]'} ml-2`}>
                  Select a date to view available time slots
                </span>
              </div>
            </div>

            {/* Time Slots Section */}
            {selectedDate && (
              <div>
                <div className="flex items-center mb-4">
                  <Clock size={20} className="text-[#C8A882]" />
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} ml-2`}>
                    Available Times
                  </h2>
                </div>

                {renderTimeSlots()}
              </div>
            )}
          </div>
        )}
        
        {currentStep === 2 && (
          <div>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} mb-3`}>
                Booking Details
              </h2>
              
              <div className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-[#2A2A2A]' : 'bg-[#F9F5ED]'}`}>
                <div className="flex justify-between mb-2">
                  <span className={`font-medium ${isDark ? "text-white" : "text-[#5D4E37]"}`}>Service:</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>{service_name}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className={`font-medium ${isDark ? "text-white" : "text-[#5D4E37]"}`}>Date:</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>
                    {new Date(selectedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className={`font-medium ${isDark ? "text-white" : "text-[#5D4E37]"}`}>Time:</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>{selectedTime}</span>
                </div>
                
                {serviceData?.service && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className={`font-medium ${isDark ? "text-white" : "text-[#5D4E37]"}`}>Duration:</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>
                        {serviceData.service.duration_minutes} minutes
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDark ? "text-white" : "text-[#5D4E37]"}`}>Price:</span>
                      <span className={`font-semibold text-[#E91E63]"}`}>
                        ${parseFloat(serviceData.service.price).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Formik
              initialValues={{ name: '', email: '', phone: '', notes: '' }}
              validationSchema={BookingSchema}
              onSubmit={handleBookAppointment}
            >
              {({ isSubmitting }) => (
                <Form>
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} mb-4`}>
                    Your Information
                  </h2>
                  
                  {/* Name Field */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${isDark ? "text-white" : "text-[#5D4E37]"} mb-1`}>
                      Full Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-[#1E1E1E] border-[#333333] text-white' 
                          : 'bg-white border-[#E8DCC0] text-[#5D4E37]'
                      }`}
                      placeholder="Enter your full name"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Email Field */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${isDark ? "text-white" : "text-[#5D4E37]"} mb-1`}>
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-[#1E1E1E] border-[#333333] text-white' 
                          : 'bg-white border-[#E8DCC0] text-[#5D4E37]'
                      }`}
                      placeholder="Enter your email"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Phone Field */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${isDark ? "text-white" : "text-[#5D4E37]"} mb-1`}>
                      Phone Number
                    </label>
                    <Field
                      type="tel"
                      name="phone"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-[#1E1E1E] border-[#333333] text-white' 
                          : 'bg-white border-[#E8DCC0] text-[#5D4E37]'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Notes Field */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium ${isDark ? "text-white" : "text-[#5D4E37]"} mb-1`}>
                      Notes (Optional)
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-[#1E1E1E] border-[#333333] text-white' 
                          : 'bg-white border-[#E8DCC0] text-[#5D4E37]'
                      }`}
                      placeholder="Any special requests or information"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-medium ${
                      isSubmitting ? 'bg-[#A0927A]' : 'bg-[#C8A882] hover:bg-[#B89872]'
                    } text-white transition-colors`}
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        {currentStep === 3 && bookingDetails && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#22C55E] flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-white" />
            </div>
            
            <h2 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} mb-4`}>
              Booking Confirmed!
            </h2>
            
            <p className={`text-base ${isDark ? "text-[#CCCCCC]" : "text-[#8B7355]"} mb-8 leading-relaxed`}>
              Your appointment has been successfully booked. You'll receive a confirmation email shortly.
            </p>
            
            <div className={`rounded-xl p-5 mb-8 text-left ${isDark ? 'bg-[#2A2A2A]' : 'bg-[#F9F5ED]'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"} mb-4`}>
                Appointment Details
              </h3>
              
              <div className="mb-3">
                <p className={`text-sm ${isDark ? "text-[#CCCCCC]" : "text-[#8B7355]"} mb-1`}>Service</p>
                <p className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>
                  {service_name}
                </p>
              </div>
              
              <div className="mb-3">
                <p className={`text-sm ${isDark ? "text-[#CCCCCC]" : "text-[#8B7355]"} mb-1`}>Date & Time</p>
                <p className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>
                  {new Date(bookingDetails.booking_date).toLocaleDateString()} at {bookingDetails.start_time}
                </p>
              </div>
              
              <div className="mb-3">
                <p className={`text-sm ${isDark ? "text-[#CCCCCC]" : "text-[#8B7355]"} mb-1`}>Booking ID</p>
                <p className={`font-semibold ${isDark ? "text-white" : "text-[#5D4E37]"}`}>
                  #{bookingDetails.id}
                </p>
              </div>
              
              {bookingDetails.notes && (
                <div>
                  <p className={`text-sm ${isDark ? "text-[#CCCCCC]" : "text-[#8B7355]"} mb-1`}>Notes</p>
                  <p className={isDark ? "text-white" : "text-[#5D4E37]"}>
                    {bookingDetails.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleViewBookings}
                className="flex-1 py-3 rounded-xl font-medium bg-[#C8A882] hover:bg-[#B89872] text-white transition-colors"
              >
                View Bookings
              </button>
              
              <button
                onClick={handleBackToServices}
                className={`flex-1 py-3 rounded-xl font-medium border ${
                  isDark 
                    ? 'bg-[#2A2A2A] border-[#C8A882] text-[#C8A882] hover:bg-[#3A3A3A]' 
                    : 'bg-[#F9F5ED] border-[#C8A882] text-[#C8A882] hover:bg-[#E8DCC0]'
                } transition-colors`}
              >
                Book Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button for Step 1 */}
      {currentStep === 1 && selectedDate && selectedTime && (
        <div className={`fixed bottom-0 left-0 right-0 px-6 py-5 ${isDark ? 'bg-[#121212]' : 'bg-[#FDF8F0]'} border-t ${isDark ? 'border-[#333333]' : 'border-[#E8DCC0]'}`}>
          <button
            onClick={handleDateTimeSelection}
            className="w-full py-3 rounded-xl font-medium bg-[#C8A882] hover:bg-[#B89872] text-white transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}