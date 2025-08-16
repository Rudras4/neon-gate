import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventAboutProps {
  event: {
    title: string;
    description: string;
    organizer: {
      name: string;
      description: string;
      avatar: string;
    };
  };
}

export function EventAbout({ event }: EventAboutProps) {
  const aboutSections = [
    {
      id: "event",
      title: "About Event",
      content: `${event.description}\n\nThis event promises to be an unforgettable experience with top-tier speakers, engaging content, and excellent networking opportunities. Join us for a day of learning, innovation, and connection with like-minded professionals.\n\nWhat to expect:\n• Expert speakers and thought leaders\n• Interactive workshops and sessions\n• Networking opportunities\n• Premium catering and refreshments\n• Exclusive access to event materials\n\nDon't miss this opportunity to be part of something special!`
    },
    {
      id: "organizer",
      title: "About Organizer",
      content: `${event.organizer.description}\n\nWith years of experience in organizing world-class events, our team is dedicated to delivering exceptional experiences for attendees. We believe in creating memorable moments that inspire, educate, and connect people from all walks of life.\n\nOur mission is to bring together communities through thoughtfully curated events that matter. Every event we organize is crafted with attention to detail and a focus on attendee satisfaction.`
    },
    {
      id: "speakers",
      title: "About Speakers/Artists",
      content: `Our carefully selected lineup features industry leaders and innovative thinkers who will share their expertise and insights.\n\n• Keynote speakers with decades of experience\n• Rising stars and emerging voices\n• Interactive panel discussions\n• Q&A sessions with direct access to speakers\n\nEach speaker brings unique perspectives and practical knowledge that you can apply immediately in your professional or personal journey.`
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      content: `Please read these terms carefully before purchasing your ticket:\n\n1. **Ticket Validity**: Tickets are valid only for the specified event date and time. No refunds for missed events.\n\n2. **Transfer Policy**: NFT tickets can be transferred or resold through our platform. Original purchaser remains responsible for compliance.\n\n3. **Entry Requirements**: Valid government-issued ID required for entry. Age restrictions may apply.\n\n4. **Cancellation**: In case of event cancellation, full refunds will be processed within 7-14 business days.\n\n5. **Behavior**: We reserve the right to remove attendees who violate our code of conduct.\n\n6. **Photography**: By attending, you consent to being photographed/recorded for promotional purposes.\n\n7. **Force Majeure**: We are not liable for events beyond our control (natural disasters, government restrictions, etc.).\n\nFor full terms and conditions, please visit our website.`
    }
  ];

  return (
    <section className="py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">About</h2>
          
          {/* Organizer Card */}
          <div className="card-elevated p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={event.organizer.avatar} />
                <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{event.organizer.name}</h3>
                <p className="text-muted-foreground">Event Organizer</p>
              </div>
            </div>
          </div>

          {/* About Sections */}
          <Accordion type="single" collapsible className="w-full">
            {aboutSections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}