import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { services } from "@/lib/data/services";
import { subscriptionPlans } from "@/lib/data/subscription-plans";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/services", changeFrequency: "weekly", priority: 0.9 },
    { path: "/subscriptions", changeFrequency: "monthly", priority: 0.8 },
    { path: "/service-areas", changeFrequency: "monthly", priority: 0.7 },
    { path: "/how-it-works", changeFrequency: "monthly", priority: 0.6 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    { path: "/help", changeFrequency: "monthly", priority: 0.5 },
  ];

  const serviceRoutes = services.map((service) => ({
    path: `/services/${service.categoryId}/${service.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    image: service.heroImage,
  }));

  const planRoutes = subscriptionPlans.map((plan) => ({
    path: `/subscriptions/${plan.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...serviceRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      images: [absoluteUrl(route.image)],
    })),
    ...planRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  ];
}
