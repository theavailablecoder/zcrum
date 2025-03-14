"use client";

import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import companies from "@/data/companies.json"; // Import the JSON file
import Image from "next/image";

const CompanyCarousel = () => {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full py-10"
    >
      <CarouselContent className= "flex gap-5 sm:gap-20 items-center">
        {companies.map((company) => {
          const { id, name, path } = company; // Destructure each company object
          return (
            <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
              <Image
                src={path} // Use the path property for the image
                alt={name} // Use the name property for alt text
                width={200}
                height={56}
                className="h-9 sm:h-14 w-auto object-contain"
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};

export default CompanyCarousel;
