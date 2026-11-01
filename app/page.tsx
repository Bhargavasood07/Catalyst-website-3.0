import { Suspense } from "react";
import { Manifesto } from "@/components/about/Manifesto";
import { ContactSection } from "@/components/contact/ContactSection";
import { EventsSection } from "@/components/events/EventsSection";
import { GallerySection } from "@/components/gallery/GallerySection";
import { Hero } from "@/components/hero/Hero";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { TeamSection } from "@/components/team/TeamSection";
import { getEvents, getGallery, getProjects, getSite, getTeam, splitEvents } from "@/lib/content";

// Re-render hourly so "upcoming" and "past" move on their own, without a redeploy.
export const revalidate = 3600;

export default function HomePage() {
  const now = Date.now();
  const site = getSite();
  const { upcoming, past } = splitEvents(getEvents(), now);

  return (
    <>
      {/* Each section sits in its own Suspense boundary so React hydrates them
          one at a time, yielding to the browser in between, instead of in one
          long blocking task. The HTML is already on screen; nothing flashes. */}
      <Suspense>
        <Hero site={site} upcoming={upcoming} now={now} />
      </Suspense>
      <Suspense>
        <Manifesto manifesto={site.manifesto} />
      </Suspense>
      <Suspense>
        <EventsSection site={site} upcoming={upcoming} past={past} now={now} />
      </Suspense>
      <Suspense>
        <GallerySection gallery={getGallery()} />
      </Suspense>
      <Suspense>
        <ProjectsSection projects={getProjects()} />
      </Suspense>
      <Suspense>
        <TeamSection team={getTeam()} />
      </Suspense>
      <Suspense>
        <ContactSection site={site} now={now} />
      </Suspense>
    </>
  );
}
