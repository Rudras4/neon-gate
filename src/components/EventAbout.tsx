import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, User, Building2, Users, FileText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EventAboutProps {
  event: {
    title: string;
    description: string;
    longDescription?: string;
    organizer: {
      name: string;
      description: string;
      avatar: string;
    };
    speakers?: Array<{
      name: string;
      role: string;
      bio: string;
      avatar?: string;
    }>;
    terms?: string;
  };
}

export function EventAbout({ event }: EventAboutProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    about: true,
    organizer: false,
    speakers: false,
    terms: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-8">
      {/* About this Event */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">About this Event</h2>
        <p className="text-muted-foreground leading-relaxed">
          {event.longDescription || event.description}
        </p>
      </div>

      {/* About Section with Collapsible Items */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">About</h2>
        
        {/* Organizer Card */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={event.organizer.avatar} />
              <AvatarFallback className="text-lg">
                {event.organizer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{event.organizer.name}</h3>
              <Badge variant="outline">Event Organizer</Badge>
            </div>
          </div>
          <p className="text-muted-foreground">{event.organizer.description}</p>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-2">
          {/* About Event */}
          <Collapsible
            open={openSections.about}
            onOpenChange={() => toggleSection('about')}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">About Event</span>
                </div>
                {openSections.about ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="text-muted-foreground space-y-3">
                <p>{event.longDescription || event.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Event Type:</strong> Conference
                  </div>
                  <div>
                    <strong>Duration:</strong> 8 hours
                  </div>
                  <div>
                    <strong>Language:</strong> English
                  </div>
                  <div>
                    <strong>Age Limit:</strong> 18+
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* About Organizer */}
          <Collapsible
            open={openSections.organizer}
            onOpenChange={() => toggleSection('organizer')}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">About Organizer</span>
                </div>
                {openSections.organizer ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="text-muted-foreground space-y-3">
                <p>{event.organizer.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>Professional event organizer with 10+ years of experience</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* About Speakers/Artists */}
          <Collapsible
            open={openSections.speakers}
            onOpenChange={() => toggleSection('speakers')}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">About Speakers/Artists</span>
                </div>
                {openSections.speakers ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="text-muted-foreground space-y-4">
                {event.speakers && event.speakers.length > 0 ? (
                  <div className="grid gap-4">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={speaker.avatar} />
                          <AvatarFallback>
                            {speaker.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{speaker.name}</h4>
                          <p className="text-sm text-muted-foreground">{speaker.role}</p>
                          <p className="text-sm mt-1">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Speaker information will be announced soon.</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Terms & Conditions */}
          <Collapsible
            open={openSections.terms}
            onOpenChange={() => toggleSection('terms')}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Terms & Conditions</span>
                </div>
                {openSections.terms ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="text-muted-foreground space-y-3">
                {event.terms ? (
                  <p>{event.terms}</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    <p><strong>Refund Policy:</strong> No refunds available for this event.</p>
                    <p><strong>Entry Requirements:</strong> Valid ID required for entry.</p>
                    <p><strong>Photography:</strong> Photography and recording are not permitted.</p>
                    <p><strong>Late Entry:</strong> Late entry may not be permitted.</p>
                    <p><strong>Security:</strong> All attendees are subject to security screening.</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}