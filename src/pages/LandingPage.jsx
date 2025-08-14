import { Button, Carousel, Typography } from "antd";
import { motion } from "framer-motion";
import {
  Calendar,
  Car,
  Clock,
  Coffee,
  Mail,
  MapPin,
  Menu,
  Phone,
  Shield,
  Star,
  Tv,
  Users,
  Wifi,
  X,
} from "lucide-react";
import React, { useState } from "react";

const { Title, Paragraph, Text } = Typography;
const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroImages = [
    "https://www.hotelsogo.com/images/slider/1683962739_website%20banner%203.jpg",
    "https://www.hotelsogo.com/images/slider/1712230644_IOT.jpg",
    "https://www.hotelsogo.com/images/slider/1683962703_website%20banner%202.jpg",
    "https://www.hotelsogo.com/images/slider/1683962722_website%20banner%201.jpg",
  ];

  const rooms = [
    {
      name: "Standard Room",
      price: "₱2,500",
      image: "https://www.hotelsogo.com/images/photos/1555053327_Premium.jpg",
      features: ["Queen Bed", "Private Bath", "AC", "Cable TV"],
    },
    {
      name: "Deluxe Room",
      price: "₱3,200",
      image: "https://www.hotelsogo.com/images/photos/1555053376_Deluxe.jpg",
      features: ["King Bed", "Jacuzzi", "Mini Bar", "Premium Amenities"],
    },
    {
      name: "Suite Room",
      price: "₱4,500",
      image: "https://www.hotelsogo.com/images/photos/1555053991_Pipe.jpg",
      features: [
        "Separate Living Area",
        "Luxury Bath",
        "Kitchenette",
        "City View",
      ],
    },
    {
      name: "Executive Room",
      price: "₱5,800",
      image:
        "https://www.hotelsogo.com/images/photos/1555053449_Executive (2)-min.jpg",
      features: [
        "Spacious Suite",
        "Business Amenities",
        "Complimentary Breakfast",
        "24/7 Room Service",
      ],
    },
    {
      name: "Mega Room",
      price: "₱6,500",
      image:
        "https://www.hotelsogo.com/images/photos/1555050969_roman%201-min.jpg",
      features: [
        "Extra Spacious",
        "Luxury Amenities",
        "Private Balcony",
        "Panoramic View",
      ],
    },
    {
      name: "Executive Garage",
      price: "₱5,800",
      image: "https://www.hotelsogo.com/images/photos/1555053991_Pipe.jpg",
      features: [
        "Spacious Suite",
        "Business Amenities",
        "Complimentary Breakfast",
        "24/7 Room Service",
      ],
    },
  ];

  const locations = [
    { name: "SOGO BGC", address: "Bonifacio Global City, Taguig" },
    { name: "SOGO Malate", address: "Malate, Manila" },
    { name: "SOGO Cubao", address: "Quezon City" },
    { name: "SOGO Ortigas", address: "Pasig City" },
  ];

  const amenities = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Free WiFi",
      desc: "High-speed internet in all rooms",
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: "Parking",
      desc: "Secure parking facilities",
    },
    {
      icon: <Coffee className="w-8 h-8" />,
      title: "Room Service",
      desc: "24/7 room service available",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security",
      desc: "24/7 security and CCTV",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Front Desk",
      desc: "Round-the-clock assistance",
    },
    {
      icon: <Tv className="w-8 h-8" />,
      title: "Entertainment",
      desc: "Cable TV and premium channels",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-600">HOTEL SOGO</div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Button type="link" danger href="#home">
                  Home
                </Button>
                <Button type="link" danger href="#rooms">
                  Rooms
                </Button>
                <Button type="link" danger href="#amenities">
                  Amenities
                </Button>
                <Button type="link" danger href="#locations">
                  Locations
                </Button>
                <Button type="link" danger href="#contact">
                  Contact
                </Button>

                <Button type="primary" size="large">
                  Book Now
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-red-600"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#home"
                className="text-gray-900 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </a>
              <a
                href="#rooms"
                className="text-gray-900 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Rooms
              </a>
              <a
                href="#amenities"
                className="text-gray-900 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Amenities
              </a>
              <a
                href="#locations"
                className="text-gray-900 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Locations
              </a>
              <a
                href="#contact"
                className="text-gray-900 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Contact
              </a>
              <button className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700">
                Book Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <Carousel
          autoplay
          autoplaySpeed={5000}
          effect="fade"
          className="h-full"
        >
          {heroImages.map((image, index) => (
            <div key={index} className="h-screen relative">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Title className="!text-white !text-5xl md:!text-7xl !mb-6">
                Welcome to <span className="!text-red-500">HOTEL SOGO</span>
              </Title>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Paragraph className="!text-white !text-xl md:!text-2xl !mb-8 max-w-3xl mx-auto">
                Experience comfort, luxury, and exceptional service at the heart
                of the city
              </Paragraph>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  size="large"
                  className="bg-red-600 border-red-600 px-8 py-4 h-auto text-lg"
                >
                  Book Your Stay
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="large"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 h-auto text-lg bg-transparent"
                >
                  Explore Rooms
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our carefully designed rooms that combine comfort with
              modern amenities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {room.price}/night
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {room.name}
                  </h3>
                  <div className="space-y-2 mb-6">
                    {room.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-gray-600"
                      >
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hotel Amenities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enjoy world-class amenities designed to make your stay comfortable
              and memorable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="text-red-600 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {amenity.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {amenity.title}
                </h3>
                <p className="text-gray-600">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Locations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find us in prime locations across Metro Manila
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <MapPin className="w-8 h-8 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {location.name}
                </h3>
                <p className="text-gray-600 mb-4">{location.address}</p>
                <button className="text-red-600 hover:text-red-700 font-semibold">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Excellent service and clean rooms. The staff was very
                  accommodating and the location is perfect for business
                  travelers."
                </p>
                <div className="font-semibold text-gray-900">
                  Guest {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">Contact Us</h2>
              <p className="text-xl mb-8">
                Ready to book your stay? Get in touch with us for reservations
                and inquiries.
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 mr-4" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div>+63 2 8888 SOGO (7646)</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 mr-4" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div>reservations@hotelsogo.com</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-4" />
                  <div>
                    <div className="font-semibold">Main Office</div>
                    <div>Multiple locations across Metro Manila</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <textarea
                    rows="4"
                    placeholder="Your Message"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  ></textarea>
                </div>
                <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-red-500 mb-4">
                HOTEL SOGO
              </div>
              <p className="text-gray-400">
                Your premier destination for comfort and luxury in Metro Manila.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#home"
                    className="hover:text-white transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#rooms"
                    className="hover:text-white transition-colors"
                  >
                    Rooms
                  </a>
                </li>
                <li>
                  <a
                    href="#amenities"
                    className="hover:text-white transition-colors"
                  >
                    Amenities
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Room Service</li>
                <li>Concierge</li>
                <li>Business Center</li>
                <li>Parking</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div>+63 2 8888 SOGO</div>
                <div>info@hotelsogo.com</div>
                <div>Metro Manila, Philippines</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Hotel SOGO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
