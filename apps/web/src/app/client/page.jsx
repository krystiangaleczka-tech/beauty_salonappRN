import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Star, 
  Gift, 
  Package,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function ClientHomePage() {
  const navigate = useNavigate();
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return response.json();
    },
  });

  const handleServiceSelect = (service) => {
    navigate(`/client/book-service?service_id=${service.id}&service_name=${encodeURIComponent(service.name)}`);
  };

  // Sample data for demonstrations
  const serviceGallery = [
    { id: 1, title: "Perfect Manicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=200&fit=crop" },
    { id: 2, title: "Hair Styling", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=200&fit=crop" },
    { id: 3, title: "Facial Treatment", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=300&h=200&fit=crop" },
  ];

  const promotions = [
    {
      id: 1,
      title: "New Client Special",
      description: "20% off your first appointment",
      discount: "20%",
      validUntil: "Dec 31, 2024"
    },
    {
      id: 2,
      title: "Referral Bonus",
      description: "Bring a friend and both get 15% off",
      discount: "15%",
      validUntil: "Ongoing"
    }
  ];

  const serviceBundles = [
    {
      id: 1,
      title: "Mani + Pedi Combo",
      description: "Manicure + Pedicure together",
      originalPrice: 65,
      bundlePrice: 60,
      discount: "5% cheaper",
      services: ["Manicure", "Pedicure"]
    },
    {
      id: 2,
      title: "Spa Day Package",
      description: "Facial + Hair Treatment + Massage",
      originalPrice: 180,
      bundlePrice: 160,
      discount: "11% cheaper",
      services: ["Facial", "Hair Treatment", "Massage"]
    }
  ];

  const renderServiceCard = (service) => (
    <div
      key={service.id}
      onClick={() => handleServiceSelect(service)}
      className="bg-white rounded-xl p-4 mr-3 mb-2 border border-[#F4E6D7] w-80 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-[#5D4E37] mb-1">
          {service.name}
        </h3>
        <p className="text-sm text-[#8B7355] leading-relaxed">
          {service.description}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Clock size={14} className="text-[#8B7355]" />
          <span className="text-sm font-medium text-[#8B7355] ml-1">
            {service.duration_minutes} min
          </span>
        </div>

        <div className="flex items-center">
          <DollarSign size={14} className="text-[#E91E63]" />
          <span className="text-lg font-semibold text-[#E91E63]">
            {parseFloat(service.price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderGalleryItem = (item) => (
    <div
      key={item.id}
      className="mr-3 rounded-xl overflow-hidden w-40 h-28 relative group cursor-pointer"
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
          <p className="text-white text-sm font-medium">
            {item.title}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPromotion = (promo) => (
    <div
      key={promo.id}
      className="bg-[#FCE4EC] rounded-xl p-4 mr-3 border border-[#F8BBD9] w-64"
    >
      <div className="flex items-center mb-2">
        <Gift size={16} className="text-[#E91E63]" />
        <span className="text-sm font-semibold text-[#E91E63] ml-2">
          {promo.discount}
        </span>
      </div>
      <h3 className="text-base font-semibold text-[#5D4E37] mb-1">
        {promo.title}
      </h3>
      <p className="text-sm text-[#8B7355] mb-2">
        {promo.description}
      </p>
      <p className="text-xs text-[#B8A082]">
        Valid until {promo.validUntil}
      </p>
    </div>
  );

  const renderBundle = (bundle) => (
    <div
      key={bundle.id}
      className="bg-white rounded-xl p-4 mr-3 border border-[#F4E6D7] w-72 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center mb-2">
        <Package size={16} className="text-[#E91E63]" />
        <span className="text-sm font-semibold text-[#E91E63] ml-2">
          {bundle.discount}
        </span>
      </div>
      <h3 className="text-base font-semibold text-[#5D4E37] mb-1">
        {bundle.title}
      </h3>
      <p className="text-sm text-[#8B7355] mb-3">
        {bundle.description}
      </p>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-[#8B7355] line-through">
            ${bundle.originalPrice}
          </span>
          <span className="text-lg font-semibold text-[#E91E63] ml-2">
            ${bundle.bundlePrice}
          </span>
        </div>
        <ArrowRight size={16} className="text-[#E91E63]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Header */}
      <header className="pt-8 px-6 pb-6 bg-[#FDF8F0] border-b border-[#F4E6D7]">
        <h1 className="text-3xl font-bold text-[#5D4E37] mb-2">
          Welcome to Bella Beauty
        </h1>
        <p className="text-lg text-[#8B7355]">
          Your beauty journey starts here
        </p>
      </header>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Featured Video Section */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl overflow-hidden h-48 border border-[#F4E6D7] relative group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop"
              alt="Featured Video"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-[#E91E63] rounded-full w-16 h-16 flex items-center justify-center mb-3">
                <Play size={24} className="text-white" />
              </div>
              <span className="text-white text-lg font-semibold">
                Watch Our Services
              </span>
            </div>
          </div>
        </section>

        {/* New Services Section */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Sparkles size={20} className="text-[#E91E63]" />
            <h2 className="text-xl font-semibold text-[#5D4E37] ml-2">
              New Services
            </h2>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-2 px-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 mr-3 w-80 h-32 animate-pulse"
                />
              ))
            ) : servicesData?.services?.length > 0 ? (
              servicesData.services.slice(0, 5).map(renderServiceCard)
            ) : (
              <p className="text-sm text-[#8B7355] italic">
                No services available
              </p>
            )}
          </div>
        </section>

        {/* Service Gallery */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#5D4E37] mb-2">
            Our Work
          </h2>
          <p className="text-sm text-[#8B7355] mb-4">
            See what we've created
          </p>

          <div className="flex overflow-x-auto pb-4 -mx-2 px-2">
            {serviceGallery.map(renderGalleryItem)}
          </div>
        </section>

        {/* Promotions */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <Gift size={20} className="text-[#E91E63]" />
            <h2 className="text-xl font-semibold text-[#5D4E37] ml-2">
              Special Offers
            </h2>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-2 px-2">
            {promotions.map(renderPromotion)}
          </div>
        </section>

        {/* Service Bundles */}
        <section className="mb-10">
          <div className="flex items-center mb-2">
            <Package size={20} className="text-[#E91E63]" />
            <h2 className="text-xl font-semibold text-[#5D4E37] ml-2">
              Service Bundles
            </h2>
          </div>
          <p className="text-sm text-[#8B7355] mb-4">
            Save more with combo packages
          </p>

          <div className="flex overflow-x-auto pb-4 -mx-2 px-2">
            {serviceBundles.map(renderBundle)}
          </div>
        </section>
      </div>
    </div>
  );
}