import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, DollarSign, Users, Play, Gift, Package, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-[#FDF8F0]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#5D4E37]">Bella Beauty Salon</h1>
          <p className="text-sm md:text-base text-[#8B7355] mt-2">Welcome to our beauty salon</p>
        </header>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link 
            to="/client" 
            className="bg-white rounded-xl p-6 border border-[#E8DCC0] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-[#C8A88222]">
                <CalendarDays color="#C8A882" size={20} />
              </div>
              <div className="ml-4">
                <div className="text-lg font-semibold text-[#5D4E37]">Client Portal</div>
                <div className="text-sm text-[#8B7355]">Book services and view offers</div>
              </div>
            </div>
            <div className="text-[#C8A882] font-medium flex items-center">
              Go to client portal <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>

          <Link 
            to="/admin" 
            className="bg-white rounded-xl p-6 border border-[#E8DCC0] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-[#3B82F622]">
                <Users color="#3B82F6" size={20} />
              </div>
              <div className="ml-4">
                <div className="text-lg font-semibold text-[#5D4E37]">Employee Dashboard</div>
                <div className="text-sm text-[#8B7355]">Manage appointments and view stats</div>
              </div>
            </div>
            <div className="text-[#3B82F6] font-medium flex items-center">
              Go to dashboard <ArrowRight size={16} className="ml-2" />
            </div>
          </Link>
        </div>

        {/* Featured Services */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Sparkles size={20} className="text-[#E91E63]" />
            <h2 className="text-xl font-semibold text-[#5D4E37] ml-2">
              Featured Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-[#F4E6D7] shadow-sm">
              <h3 className="text-lg font-semibold text-[#5D4E37] mb-2">Manicure</h3>
              <p className="text-sm text-[#8B7355] mb-3">Professional nail care and polish</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock size={14} className="text-[#8B7355]" />
                  <span className="text-sm text-[#8B7355] ml-1">60 min</span>
                </div>
                <div className="flex items-center">
                  <DollarSign size={14} className="text-[#E91E63]" />
                  <span className="text-lg font-semibold text-[#E91E63]">45.00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#F4E6D7] shadow-sm">
              <h3 className="text-lg font-semibold text-[#5D4E37] mb-2">Facial Treatment</h3>
              <p className="text-sm text-[#8B7355] mb-3">Rejuvenating facial with premium products</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock size={14} className="text-[#8B7355]" />
                  <span className="text-sm text-[#8B7355] ml-1">90 min</span>
                </div>
                <div className="flex items-center">
                  <DollarSign size={14} className="text-[#E91E63]" />
                  <span className="text-lg font-semibold text-[#E91E63]">85.00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#F4E6D7] shadow-sm">
              <h3 className="text-lg font-semibold text-[#5D4E37] mb-2">Hair Styling</h3>
              <p className="text-sm text-[#8B7355] mb-3">Professional cut and styling</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock size={14} className="text-[#8B7355]" />
                  <span className="text-sm text-[#8B7355] ml-1">75 min</span>
                </div>
                <div className="flex items-center">
                  <DollarSign size={14} className="text-[#E91E63]" />
                  <span className="text-lg font-semibold text-[#E91E63]">65.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Offers */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Gift size={20} className="text-[#E91E63]" />
            <h2 className="text-xl font-semibold text-[#5D4E37] ml-2">
              Special Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FCE4EC] rounded-xl p-4 border border-[#F8BBD9]">
              <div className="flex items-center mb-2">
                <Gift size={16} className="text-[#E91E63]" />
                <span className="text-sm font-semibold text-[#E91E63] ml-2">20%</span>
              </div>
              <h3 className="text-base font-semibold text-[#5D4E37] mb-1">New Client Special</h3>
              <p className="text-sm text-[#8B7355] mb-2">20% off your first appointment</p>
              <p className="text-xs text-[#B8A082]">Valid until Dec 31, 2024</p>
            </div>

            <div className="bg-[#FCE4EC] rounded-xl p-4 border border-[#F8BBD9]">
              <div className="flex items-center mb-2">
                <Package size={16} className="text-[#E91E63]" />
                <span className="text-sm font-semibold text-[#E91E63] ml-2">5% cheaper</span>
              </div>
              <h3 className="text-base font-semibold text-[#5D4E37] mb-1">Mani + Pedi Combo</h3>
              <p className="text-sm text-[#8B7355] mb-2">Manicure + Pedicure together</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B7355] line-through">$65</span>
                <span className="text-lg font-semibold text-[#E91E63]">$60</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#5D4E37] mb-4">About Bella Beauty</h2>
          <div className="bg-white rounded-xl p-6 border border-[#E8DCC0]">
            <p className="text-[#8B7355] mb-4">
              At Bella Beauty, we're dedicated to providing exceptional beauty services in a relaxing and welcoming environment. 
              Our team of experienced professionals is committed to helping you look and feel your best.
            </p>
            <p className="text-[#8B7355]">
              Whether you're looking for a quick manicure, a rejuvenating facial, or a complete makeover, 
              we have the expertise and products to meet your needs.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
