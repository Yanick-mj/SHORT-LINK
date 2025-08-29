import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context';

const Lading = () => {
  const [longUrl, setLongUrl] = useState();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleShorten = (e) => {
      e.preventDefault()
      if (longUrl) {
        if (user) {
          // Si l'utilisateur est connecté, rediriger vers le dashboard avec l'URL
          navigate(`/dashboard?url=${encodeURIComponent(longUrl)}`);
        } else {
          // Si l'utilisateur n'est pas connecté, rediriger vers l'auth
          navigate(`/auth?createNew=${encodeURIComponent(longUrl)}`);
        }
      }
  };


  return (

    <div className="flex flex-col items-center">
      <h2 className="my-10 sm:my-16 text-3xl sm:text-6xl lg:text-7xl xl:text-8xl text-white text-center font-extrabold">
        The only shortener <br />you&rsquo;ll never need! 🤌
      </h2>

      <form onSubmit={handleShorten} className="sm:h-14 flex flex-col sm:flex-row w-full my-11 md:px-11 gap-2">
        <Input
          type="url"
          value={longUrl}
          placeholder="Enter your looong URL"
          className="h-full flex-1 py-4 px-4"
          autoFocus
          aria-label="Enter your long URL to shorten"
          onChange={(e) => setLongUrl(e.target.value)}
        />

        <Button
          className="h-full py-4 px-4 transition-all duration-200 hover:scale-105"
          type="submit"
          variant="destructive"
          aria-label="Shorten your URL"
        >
          Shorten !
        </Button>
      </form>
      <img src="/banner.jpeg" alt="Banner showing URL shortening concept" className="w-full my-11 md:px-11 xl:px-16"/>

      <Accordion type="multiple" collapsible="true" className="w-full my-11 md:px-11 xl:px-16">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            Do I need an account to use the app?
          </AccordionTrigger>
          <AccordionContent>
            Yes. Creating an account allows you to manage your shortened URLs,
            view analytics, and access additional features.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            What analytics are available for my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            When you enter a long URL, our app generates a shortened URL.
            This shortened URL redirects to the original long URL when clicked.
            You can track the number of clicks, geographic location of visitors,
            and referral sources for each shortened URL.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            How secure are my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            All URLs are encrypted and stored securely. We use industry-standard
            security practices to protect your data. You can also set expiration
            dates for your links and delete them at any time.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>
            Can I customize my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            Yes! You can create custom short codes for your URLs, making them
            more memorable and brand-friendly. For example, instead of "abc123",
            you could use "my-brand" for your shortened link.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  )
};

export default Lading;
