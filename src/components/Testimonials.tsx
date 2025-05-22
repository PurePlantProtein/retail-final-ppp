
import React from 'react';

type TestimonialProps = {
  name: string;
  title: string;
  content: string;
  rating: number;
};

const Testimonial = ({ name, title, content, rating }: TestimonialProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-w-[300px] md:min-w-[400px] mx-4 flex-shrink-0">
      <div className="flex text-yellow-400 mb-3">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 mb-4">{content}</p>
      <div>
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-gray-500 text-sm">{title}</p>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Peter Murray",
      title: "Osteopath",
      content: "Meeting your daily protein intake is invaluable. I rely on PPP every day to ensure my clients get the best results.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      title: "Fitness Trainer",
      content: "PP Protein has been a game-changer for my gym. My clients love the taste and the results speak for themselves.",
      rating: 5,
    },
    {
      name: "Mark Williams",
      title: "Health Food Store Owner",
      content: "The wholesale program is excellent. Great margins and my customers keep coming back for more.",
      rating: 5,
    },
    {
      name: "Jennifer Lee",
      title: "Nutritionist",
      content: "I recommend PP Protein to all my clients. The quality is unmatched and the amino acid profile is perfect.",
      rating: 5,
    },
  ];

  return (
    <div className="py-12 bg-gradient-to-r from-cyan-50 to-cyan-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What our customers are saying</h2>
        
        <div className="overflow-hidden">
          <div className="flex animate-marquee">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
            {/* Duplicate testimonials for seamless looping */}
            {testimonials.map((testimonial, index) => (
              <Testimonial key={`dup-${index}`} {...testimonial} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
