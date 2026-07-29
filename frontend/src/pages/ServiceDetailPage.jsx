import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ServerCrash, Wrench as WrenchSearch } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SeoHead from "../seo/SeoHead";
import { buildServiceSchema, buildBreadcrumbSchema } from "../seo/schema";
import { absoluteUrl, SITE_NAME } from "../seo/config";
import { getServiceIcon } from "../data/serviceIcons";
import { business } from "../data/content";
import { api } from "../utils/api";

function ServiceCard({ service }) {
  const Icon = getServiceIcon(service.icon);
  return (
    <Link
      to={`/services/${service.slug}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-bold text-primary">{service.title}</h3>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{service.summary}</p>
    </Link>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState("loading");
  const [retryToken, setRetryToken] = useState(0);
  const [service, setService] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/services/slug/${slug}`)
      .then((data) => {
        if (cancelled) return;
        setService(data.service);
        setRelated((data.related || []).filter((s) => s.status === "active"));
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.status === 404 ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, retryToken]);

  const Icon = service ? getServiceIcon(service.icon) : null;
  const quoteMessage = service
    ? encodeURIComponent(`Hi ITPlace, I'd like more information about your ${service.title} service.`)
    : "";

  const seoTitle = service ? service.seo?.title || `${service.title} | ${SITE_NAME} Services` : "";
  const seoDescription = service
    ? service.seo?.description || service.summary || `${service.title} — professional ICT service from ${SITE_NAME}.`
    : "";
  const canonical = service ? service.seo?.canonicalUrl || absoluteUrl(`/services/${service.slug}`) : "";

  return (
    <section className="bg-background py-10 md:py-16">
      {status === "success" && service && (
        <SeoHead
          title={seoTitle}
          description={seoDescription}
          keywords={service.seo?.keywords?.length ? service.seo.keywords : [service.title]}
          canonical={canonical}
          ogImage={service.seo?.ogImage || service.image}
          socialTitle={service.seo?.socialTitle}
          socialDescription={service.seo?.socialDescription}
          jsonLd={[buildServiceSchema(service), buildBreadcrumbSchema([{ name: service.title, url: canonical }])]}
        />
      )}
      {status === "not-found" && <SeoHead title={`Service Not Found | ${SITE_NAME}`} robots="noindex, follow" />}

      <div className="container-app">
        {status === "success" && service && (
          <Breadcrumbs items={[{ label: "Services", to: "/#services" }, { label: service.title }]} />
        )}

        <div className="mt-6">
          {status === "loading" ? (
            <div className="max-w-2xl">
              <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-9 w-1/2 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : status === "not-found" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <WrenchSearch size={28} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-lg font-bold text-primary">Service not found</h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                This service may have been removed or renamed.
              </p>
              <Link
                to="/#services"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
              >
                View All Services
              </Link>
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ServerCrash size={28} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-lg font-bold text-primary">Couldn't load this service</h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Something went wrong. Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => setRetryToken((t) => t + 1)}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
                <div className="order-2 md:order-1">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-2xl font-bold text-primary md:text-3xl">{service.title}</h1>
                  <p className="mt-4 text-sm leading-relaxed text-secondary">{service.summary}</p>

                  <div className="mt-6">
                    <a
                      href={`${business.whatsappLink}?text=${quoteMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#20bd5a] cursor-pointer"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Enquire on WhatsApp
                    </a>
                  </div>
                </div>
                <div className="order-1 aspect-video w-full overflow-hidden rounded-2xl bg-muted md:order-2">
                  <img
                    src={service.image}
                    alt={`${service.title} — ITPlace service`}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {related.length > 0 && (
                <div className="mt-16 md:mt-24">
                  <SectionHeading eyebrow="Related Services" title="You May Also Need" align="left" />
                  <motion.div layout className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
