'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Coins, ArrowRight, Heart, Search } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const products = [
  {
    id: '1',
    name: 'Health Monitor Device',
    price: 2999,
    originalPrice: 3999,
    coins: 150,
    rating: 4.8,
    reviews: 234,
    imageId: 'product-health-monitor',
    category: 'Health',
  },
  {
    id: '2',
    name: 'Comfortable Walking Shoes',
    price: 2499,
    originalPrice: 3499,
    coins: 125,
    rating: 4.9,
    reviews: 189,
    imageId: 'product-shoes',
    category: 'Comfort',
  },
  {
    id: '3',
    name: 'Reading Glasses Set',
    price: 899,
    originalPrice: 1299,
    coins: 50,
    rating: 4.7,
    reviews: 156,
    imageId: 'product-glasses',
    category: 'Essentials',
  },
  {
    id: '4',
    name: 'Medication Organizer',
    price: 599,
    originalPrice: 899,
    coins: 30,
    rating: 4.9,
    reviews: 312,
    imageId: 'product-organizer',
    category: 'Health',
  },
];

const categories = ['All', 'Health', 'Comfort', 'Essentials', 'Gifts'];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          ElderLink <span className="text-gradient-primary">Shop</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Handpicked products curated for seniors. Essential everyday products tailored for your health, comfort, and convenience.
        </p>
      </div>

      {/* Benefits Banner */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ShoppingBag, text: 'Handpicked products curated for seniors' },
              { icon: Heart, text: 'Support health, comfort, and convenience' },
              { icon: Coins, text: 'Earn ElderLink Coins with every purchase' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-primary p-2">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const image =
            PlaceHolderImages.find((p) => p.id === product.imageId) ||
            PlaceHolderImages.find((p) => p.id === 'product-health-monitor') ||
            PlaceHolderImages[0];

          return (
            <Card
              key={product.id}
              className="overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-warm group"
            >
              {image && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <Badge className="absolute top-3 right-3 bg-primary text-white">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>Earn {product.coins} coins</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                </div>
                <Button variant="gradient" className="w-full" size="lg">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shop Smart Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Shop Smart & Save More</CardTitle>
          <CardDescription>Enjoy exclusive benefits when you shop with ElderLink</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Earn Coins',
                description: 'Earn ElderLink Coins with every purchase',
                icon: Coins,
              },
              {
                title: 'Special Discounts',
                description: 'Enjoy special discounts and seasonal offers',
                icon: Star,
              },
              {
                title: 'Safe & Secure',
                description: 'Safe payments & hassle-free doorstep delivery',
                icon: Heart,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center p-4 rounded-xl border-2 bg-secondary/20">
                  <div className="rounded-full bg-gradient-primary p-3 w-fit mx-auto mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
