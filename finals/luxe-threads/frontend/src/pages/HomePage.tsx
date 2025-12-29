import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../types";
import api from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui";
import {
  StarIcon,
  TruckIcon,
  SparklesIcon,
  Undo2Icon,
  ArrowRightIcon,
  FlameIcon,
  SmileIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
} from "../components/icons";
import { RotatingText } from "../components/RotatingText";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const allProducts = await api.getProducts();
      setFeaturedProducts(allProducts.slice(0, 4));

      const arrivals = await api.getNewArrivals();
      setNewArrivals(arrivals.slice(0, 4));
    };
    fetchFeatured();
  }, []);

  const testimonials = [
    {
      name: "Alex Johnson",
      text: "The quality of the fabric is unreal. So soft and durable. I've already ordered more!",
      rating: 5,
    },
    {
      name: "Maria Garcia",
      text: "Fast shipping and beautiful packaging. The hoodie I bought is now my absolute favorite.",
      rating: 5,
    },
    {
      name: "Chris Lee",
      text: "Finally, a brand that gets minimalist design right. Everything is stylish and versatile.",
      rating: 5,
    },
  ];

  const benefits = [
    {
      icon: <SparklesIcon className="w-8 h-8 text-brand-accent" />,
      title: "Premium Fabrics",
      description:
        "We source only the finest materials for a difference you can feel.",
    },
    {
      icon: <TruckIcon className="w-8 h-8 text-brand-accent" />,
      title: "Fast Shipping",
      description:
        "Get your new favorite pieces delivered to your door quickly and reliably.",
    },
    {
      icon: <Undo2Icon className="w-8 h-8 text-brand-accent" />,
      title: "Easy Returns",
      description:
        "Not a perfect fit? No problem. We offer hassle-free returns.",
    },
  ];

  return (
    <div className="pt-4 space-y-16 md:space-y-24 animate-fadeIn pb-16">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] md:h-[85vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-brand-bg/60"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-start justify-center text-brand-primary">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-8xl font-display font-extrabold tracking-tight leading-tight">
              <span className="block">Wear Your</span>
              <span className="block">
                <RotatingText
                  words={["Style", "Energy", "Essence"]}
                  interval={3000}
                  className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                />
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl max-w-2xl font-sans text-brand-secondary leading-relaxed">
              Premium threads that match your energy. Quality fabrics, curated
              designs, zero compromise.
            </p>
            <div className="mt-10">
              <Button
                onClick={() => navigate("/categories")}
                className="px-10 py-4 text-lg font-semibold"
              >
                Explore Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
              Top Picks
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/best-sellers")}
          >
            Best{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Sellers
            </span>
          </h2>
          <p className="mt-2 text-brand-secondary font-sans">
            Discover the pieces everyone is talking about.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FlameIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
              Just In
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/new-arrivals")}
          >
            New{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Arrivals
            </span>
          </h2>
          <p className="mt-2 text-brand-secondary font-sans">
            Be the first to discover our latest additions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
          {newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-brand-secondary">
              <p>No new arrivals at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Collections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FlameIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
              Trending Now
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary">
            Shop by{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Featured Card */}
          <div
            className="md:col-span-7 relative group overflow-hidden rounded-2xl cursor-pointer h-[400px] md:h-[500px]"
            onClick={() => navigate("/category/t-shirts")}
          >
            <img
              src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1169&auto=format&fit=crop"
              alt="Graphic Tees"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white uppercase tracking-wider">
                  New Arrival
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
                Graphic Tees
              </h3>
              <p className="text-white/90 text-lg mb-4 max-w-md">
                Express yourself with bold designs and premium quality.
              </p>
              <div className="flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-semibold">Shop Now</span>
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Two Smaller Cards */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* First Small Card */}
            <div
              className="relative group overflow-hidden rounded-2xl cursor-pointer h-[240px] md:h-[242px]"
              onClick={() => navigate("/category/hoodies")}
            >
              <img
                src="https://images.unsplash.com/photo-1509942774463-acf339cf87d5?q=80&w=1170&auto=format&fit=crop"
                alt="Cozy Hoodies"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/60 via-pink-500/40 to-transparent group-hover:from-purple-600/70 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                  Cozy Hoodies
                </h3>
                <div className="flex items-center gap-2 text-white/90 group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm font-medium">Explore</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Second Small Card */}
            <div
              className="relative group overflow-hidden rounded-2xl cursor-pointer h-[240px] md:h-[242px]"
              onClick={() => navigate("/category/accessories")}
            >
              <img
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=880&auto=format&fit=crop"
                alt="Accessories"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-purple-500/40 to-transparent group-hover:from-blue-600/70 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                  Accessories
                </h3>
                <div className="flex items-center gap-2 text-white/90 group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm font-medium">Explore</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-brand-surface/50">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center">
                <div className="flex-shrink-0">{benefit.icon}</div>
                <h3 className="mt-4 text-xl font-display font-semibold text-brand-primary">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-brand-secondary">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-surface/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center gap-1">
              <SmileIcon className="w-8 h-8 text-brand-accent" />
              <p className="font-bold text-xl text-brand-primary">50K+</p>
              <p className="text-xs text-brand-secondary">Happy Customers</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShoppingBagIcon className="w-8 h-8 text-brand-accent" />
              <p className="font-bold text-xl text-brand-primary">50+</p>
              <p className="text-xs text-brand-secondary">Products Available</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StarIcon className="w-8 h-8 text-brand-accent" />
              <p className="font-bold text-xl text-brand-primary">99%</p>
              <p className="text-xs text-brand-secondary">Satisfaction Rate</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircleIcon className="w-8 h-8 text-brand-accent" />
              <p className="font-bold text-xl text-brand-primary">24/7</p>
              <p className="text-xs text-brand-secondary">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center text-brand-primary">
          What Our Customers Say
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-brand-surface p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-brand-secondary">"{testimonial.text}"</p>
              <p className="mt-4 font-semibold text-brand-primary">
                - {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
