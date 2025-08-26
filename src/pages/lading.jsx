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

const Lading = () => {
  const [longUrl, setLongUrl] = useState();
  const navigate = useNavigate();

  const handleShorten = (e) => {
      e.preventDefault()
      if (longUrl)navigate('/auth?createNew=${longUrl}');


  };


  return (

    <div className="flex flex-col intems-center">
      <h2 className="my-10 sm:my-16 text-3xl sm:text-6xl lg:text-7xl text-white text-center text-font-extrabold">
        The only shortener <br />you&rsquo;ll never need! 🤌
      </h2>

      <form onSubmit={handleShorten} className="sm:h-14 flex flex-col sm:flex-row w-full my-11 md:px-11 gap-2">
        <Input
          type = "url"
          value={longUrl}
          placeholder= "Enter your looong URL"
          className="h-full flex-1 py-4 px-4"
          autoFocus
          onChange= {(e) => setLongUrl(e.target.value)}
        />

        <Button className="h-full py-4 px-4" type="submit" variant="destructive">
          Shorten !
        </Button>
      </form>
      <img src="/banner.jpeg" alt="banner" className="w-full my-11 md:px-11"/>

      <Accordion type="multiple" collapsible="true" className="w-full my-11 md:px-11">
        <AccordionItem value="item-1">
          <AccordionTrigger>
              Do I need a account to use the app ?
          </AccordionTrigger>
          <AccordionContent>
            Yes. Creating an account allows you to manage your shortened URLs,
            view analytics, and access additional features.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            what analytics are available for my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            When you enter a long URL, our app generates a shortened URL.
            This shortened URL redirects to the original long URL when clicked
            You can track the number of clicks, geographic location of visitors,
            and referral sources for each shortened URL.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            what analytics are available for my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            When you enter a long URL, our app generates a shortened URL.
            This shortened URL redirects to the original long URL when clicked
            You can track the number of clicks, geographic location of visitors,
            and referral sources for each shortened URL.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>
            what analytics are available for my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            When you enter a long URL, our app generates a shortened URL.
            This shortened URL redirects to the original long URL when clicked
            You can track the number of clicks, geographic location of visitors,
            and referral sources for each shortened URL.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  )
};

export default Lading;
