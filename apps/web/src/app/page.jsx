import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, DollarSign, Users } from 'lucide-react';

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        throw new Error(`When fetching /api/admin/dashboard, the response was [${res.status}] ${res.statusText}`);
      }
      return res.json();
    },
  });

  const stats = data?.weeklyStats || { total_bookings: 0, total_revenue: 0, unique_customers: 0 };
  const todayAppointments = data?.todayAppointments || [];
  const upcomingAppointments = data?.upcomingAppointments || [];

  return (
    <div className="min-h-screen w-full bg-[#FDF8F0]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#5D4E37]">Employee Dashboard</h1>
          <p className="text-sm md:text-base text-[#8B7355] mt-2">Demo mode: You are auto-signed in to preview the experience</p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            Failed to load dashboard. Please try again.
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Today's Appts"
            value={todayAppointments.length}
            icon={CalendarDays}
            color="#C8A882"
          />
          <StatCard
            title="This Week's Bookings"
            value={stats.total_bookings ?? 0}
            icon={Clock}
            color="#C8A882"
          />
          <StatCard
            title="Revenue"
            value={`$${Number(stats.total_revenue ?? 0).toFixed(0)}`}
            icon={DollarSign}
            color="#22C55E"
          />
          <StatCard
            title="Customers"
            value={stats.unique_customers ?? 0}
            icon={Users}
            color="#3B82F6"
          />
        </section>

        {/* Today */}
        <Section title="Today's Appointments">
          {isLoading ? (
            <SkeletonList />
          ) : todayAppointments.length === 0 ? (
            <EmptyState message="No appointments today" />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {todayAppointments.map((a) => (
                <AppointmentCard key={a.id} appt={a} />)
              )}
            </div>
          )}
        </Section>

        {/* Upcoming */}
        <Section title="Upcoming (next 7 days)">
          {isLoading ? (
            <SkeletonList />
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState message="No upcoming appointments" />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {upcomingAppointments.slice(0, 8).map((a) => (
                <AppointmentCard key={a.id} appt={a} />)
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold text-[#5D4E37]">{title}</h2>
      <div className="rounded-xl border border-[#E8DCC0] bg-[#F9F5ED] p-4">
        {children}
      </div>
    </section>
  );
}

function StatCard({ title, value, icon: Icon, color = '#C8A882' }) {
  return (
    <div className="rounded-xl border border-[#E8DCC0] bg-[#F9F5ED] p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}22` }}>
        <Icon color={color} size={20} />
      </div>
      <div>
        <div className="text-sm text-[#8B7355]">{title}</div>
        <div className="text-xl font-semibold text-[#5D4E37]">{value}</div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt }) {
  const time = toHumanTime(appt.start_time);
  const price = Number(appt.price || 0).toFixed(2);
  return (
    <div className="rounded-xl border border-[#E8DCC0] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[#5D4E37] font-semibold">{appt.service_name}</div>
          <div className="text-[#8B7355] text-sm mt-1">{toHumanDate(appt.booking_date)} • {time} • {appt.duration_minutes} min</div>
        </div>
        <div className="text-[#C8A882] font-semibold">${price}</div>
      </div>
      {appt.notes && (
        <div className="text-[#8B7355] text-sm mt-3">Notes: {appt.notes}</div>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center p-10 text-[#8B7355]">{message}</div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-[#F1ECE1]" />
      ))}
    </div>
  );
}

function toHumanTime(time) {
  try {
    const [h, m] = String(time).split(':').map((t) => parseInt(t, 10));
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return String(time);
  }
}

function toHumanDate(date) {
  try {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(date);
  }
}
