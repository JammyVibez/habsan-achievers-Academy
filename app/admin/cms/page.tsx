"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeroCarouselEditor } from "@/components/admin/cms/hero-carousel-editor"
import { PrincipalMessageEditor } from "@/components/admin/cms/principal-message-editor"
import { AboutUsEditor } from "@/components/admin/cms/about-us-editor"
import { ContactInfoEditor } from "@/components/admin/cms/contact-info-editor"
import { GalleryCmsEditor } from "@/components/admin/cms/gallery-cms-editor"
import { CoreValuesEditor } from "@/components/admin/cms/core-values-editor"

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">Content Management</h2>
        <p className="text-muted-foreground">
          Each section has its own Save. Gallery: upload files or paste URLs, then edit items in the list.
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
          <TabsTrigger value="principal">Principal Message</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="core">Core values</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroCarouselEditor />
        </TabsContent>

        <TabsContent value="principal">
          <PrincipalMessageEditor />
        </TabsContent>

        <TabsContent value="about">
          <AboutUsEditor />
        </TabsContent>

        <TabsContent value="contact">
          <ContactInfoEditor />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryCmsEditor />
        </TabsContent>

        <TabsContent value="core">
          <CoreValuesEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
