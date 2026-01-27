import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Product } from "../types";
import api from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui";
import {
  StarIcon,
  TruckIcon,
  TrendingUpIcon,
  Undo2Icon,
  ArrowRightIcon,
  FlameIcon,
  SmileIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
  PackageIcon,
} from "../components/icons";
import { RotatingText } from "../components/RotatingText";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { SEOHead } from "../components/SEOHead";
import { StructuredData, OrganizationSchema, WebsiteSchema } from "../components/StructuredData";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [hasMoreBestSellers, setHasMoreBestSellers] = useState(false);
  const [hasMoreNewArrivals, setHasMoreNewArrivals] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      const displayLimit = 8;
      
      // Fetch Best Sellers (fetch one extra to check if there are more)
      const bestSellers = await api.getBestSellers(displayLimit + 1);
      setFeaturedProducts(bestSellers.slice(0, displayLimit));
      setHasMoreBestSellers(bestSellers.length > displayLimit);

      // Fetch New Arrivals (fetch one extra to check if there are more)
      const arrivals = await api.getNewArrivals(displayLimit + 1);
      setNewArrivals(arrivals.slice(0, displayLimit));
      setHasMoreNewArrivals(arrivals.length > displayLimit);
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
      icon: <PackageIcon className="w-8 h-8 text-brand-accent" />,
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

  // SEO Data
  const seoData = {
    title: "Luxe Threads - Premium Apparel & Custom Clothing Online",
    description: "Shop premium apparel and custom clothing at Luxe Threads. Designer t-shirts, luxury fashion, and print-on-demand apparel. Free shipping on orders over ₹500.",
    keywords: "premium apparel, luxury clothing, custom t-shirts, designer fashion, print on demand, luxury fashion online, custom clothing, designer t-shirts",
    type: "website" as const,
  };

  return (
    <>
      <SEOHead {...seoData} />
      <StructuredData data={OrganizationSchema} />
      <StructuredData data={WebsiteSchema} />
      <div className="space-y-8 md:space-y-12 animate-fadeIn pb-16">
      {/* Hero Section */}
      <section
        className="relative h-[70vh] md:h-[90vh] bg-cover bg-center -mt-2"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-brand-bg/60 dark:bg-brand-bg/60 bg-black/50"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-start justify-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-8xl font-display font-extrabold tracking-tight leading-tight text-white">
              <span className="block">Wear Your</span>
              <span className="block">
                <RotatingText
                  words={["Style", "Energy", "Essence"]}
                  interval={3000}
                  className="bg-gradient-to-r from-[#9333EA] to-[#F5E04E] bg-clip-text text-transparent"
                />
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl max-w-2xl font-sans text-white/90 leading-relaxed">
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
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Top Picks
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary">
              Best{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Sellers
              </span>
            </h2>
            <p className="mt-2 text-brand-secondary font-sans">
              Discover the pieces everyone is talking about.
            </p>
          </div>
          {hasMoreBestSellers && (
            <Button
              onClick={() => navigate("/best-sellers")}
              variant="outline"
              className="hidden sm:flex items-center gap-2"
            >
              Show All
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {hasMoreBestSellers && (
          <div className="mt-6 sm:hidden flex justify-center">
            <Button
              onClick={() => navigate("/best-sellers")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Show All
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlameIcon className="w-5 h-5 text-orange-500 dark:text-orange-500 text-orange-600" />
              <span className="text-sm font-semibold text-orange-500 dark:text-orange-500 text-orange-600 uppercase tracking-wider">
                Just In
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary">
              New{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Arrivals
              </span>
            </h2>
            <p className="mt-2 text-brand-secondary font-sans">
              Be the first to discover our latest additions.
            </p>
          </div>
          {hasMoreNewArrivals && newArrivals.length > 0 && (
            <Button
              onClick={() => navigate("/new-arrivals")}
              variant="outline"
              className="hidden sm:flex items-center gap-2"
            >
              Show All
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:gap-y-10 sm:gap-x-6 lg:grid-cols-4">
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
        {hasMoreNewArrivals && newArrivals.length > 0 && (
          <div className="mt-6 sm:hidden flex justify-center">
            <Button
              onClick={() => navigate("/new-arrivals")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Show All
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Trending Collections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlameIcon className="w-5 h-5 text-orange-500 dark:text-orange-500 text-orange-600" />
              <span className="text-sm font-semibold text-orange-500 dark:text-orange-500 text-orange-600 uppercase tracking-wider">
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
          <Button
            onClick={() => navigate("/categories")}
            variant="outline"
            className="hidden sm:flex items-center gap-2"
          >
            Show All
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
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
        <div className="mt-6 sm:hidden flex justify-center">
          <Button
            onClick={() => navigate("/categories")}
            variant="outline"
            className="flex items-center gap-2"
          >
            Show All Categories
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-brand-surface/50 dark:bg-brand-surface/50 bg-gray-50">
        <div className="container mx-auto px-4 py-8 md:py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 text-center">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center">
                <div className="flex-shrink-0">{benefit.icon}</div>
                <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-display font-semibold text-brand-primary">
                  {benefit.title}
                </h3>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-brand-secondary">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-surface/30 dark:bg-brand-surface/30 bg-gray-100 py-6 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
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
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center text-brand-primary mb-8">
          What Our Customers Say
        </h2>
        <TestimonialsCarousel testimonials={testimonials} />
      </section>
    </div>
    </>
  );
};
