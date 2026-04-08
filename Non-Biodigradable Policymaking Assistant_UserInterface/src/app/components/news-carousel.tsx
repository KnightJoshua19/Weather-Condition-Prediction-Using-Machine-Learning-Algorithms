import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Newspaper, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { theme } from '../config/theme';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  date: string;
  description: string;
  tag: string;
  tagBg: string;
}

const newsItems: NewsItem[] = [
  {
    id: '1',
    category: 'Environmental Law',
    title: 'RA 11898: Extended Producer Responsibility Act Now in Full Effect',
    date: 'March 28, 2026',
    description:
      'Producers and importers must submit waste reduction plans to DENR. Non-compliance carries fines up to ₱5 million per violation under the new implementing rules.',
    tag: 'In Effect',
    tagBg: '#556E53',
  },
  {
    id: '2',
    category: 'DENR Regulation',
    title: 'DENR Circular 2026-05: Single-Use Plastic Phase-Out Timeline Released',
    date: 'March 15, 2026',
    description:
      'New circular sets a 12-month phase-out timeline for single-use plastics in restaurants, supermarkets, and wet markets nationwide.',
    tag: 'New Circular',
    tagBg: '#29435C',
  },
  {
    id: '3',
    category: 'Senate Bill',
    title: 'SB 2341: National Recycling Infrastructure Act — 3rd Reading',
    date: 'March 5, 2026',
    description:
      'Bill proposes ₱15 billion investment for regional recycling hubs across Luzon, Visayas, and Mindanao, now up for Senate 3rd reading.',
    tag: 'Pending',
    tagBg: '#7A5C28',
  },
  {
    id: '4',
    category: 'House Bill',
    title: 'HB 7821: Mandatory Waste Segregation Penalty Bill Filed in Congress',
    date: 'February 22, 2026',
    description:
      'Proposed legislation imposes fines of up to ₱50,000 on households and establishments failing to comply with waste segregation at source.',
    tag: 'Filed',
    tagBg: '#5C4033',
  },
  {
    id: '5',
    category: 'International Agreement',
    title: 'Philippines Signs UN Global Plastics Treaty with 80 Nations',
    date: 'February 10, 2026',
    description:
      'The Philippines commits to halving plastic pollution by 2035 through coordinated national policy reform and regional ASEAN collaboration.',
    tag: 'Signed',
    tagBg: '#556E53',
  },
  {
    id: '6',
    category: 'Local Ordinance',
    title: 'Pasig City Ordinance 48: Zero-Waste Business Certification Launched',
    date: 'January 30, 2026',
    description:
      'Pasig City introduces voluntary-to-mandatory zero-waste certification for businesses, offering real property tax incentives for compliance.',
    tag: 'Enacted',
    tagBg: '#29435C',
  },
];

export function NewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-advance every 4.5 s
  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0 mt-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Newspaper className="size-4" style={{ color: theme.colors.font, opacity: 0.7 }} />
          <h3
            className="text-sm uppercase tracking-widest"
            style={{ color: theme.colors.font, opacity: 0.7, fontFamily: theme.fonts.heading }}
          >
            Latest Philippine Policy Updates
          </h3>
        </div>

        {/* Minimize/Expand button */}
        <button
          className="p-1.5 rounded-full transition-all hover:scale-110"
          style={{
            backgroundColor: `${theme.colors.theme}25`,
            color: theme.colors.font,
          }}
          aria-label={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
      </div>

      {/* Carousel content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Arrow controls */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <button
                onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                className="p-1.5 rounded-full transition-all hover:scale-110"
                style={{
                  backgroundColor: `${theme.colors.theme}25`,
                  color: theme.colors.font,
                  opacity: canScrollPrev ? 1 : 0.35,
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                className="p-1.5 rounded-full transition-all hover:scale-110"
                style={{
                  backgroundColor: `${theme.colors.theme}25`,
                  color: theme.colors.font,
                  opacity: canScrollNext ? 1 : 0.35,
                }}
                aria-label="Next"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Carousel track */}
            <div ref={emblaRef} className="overflow-hidden rounded-xl">
              <div className="flex gap-3" style={{ touchAction: 'pan-y' }}>
                {newsItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 rounded-xl p-5 flex flex-col gap-3"
                    style={{
                      // 1 card on mobile, 2 on sm, 3 on md+
                      flex: '0 0 calc(100% - 0px)',
                      minWidth: 0,
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {/* Top row: category + tag */}
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="text-xs opacity-70 leading-tight"
                        style={{ color: theme.colors.font, fontFamily: theme.fonts.body }}
                      >
                        {item.category}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: item.tagBg,
                          color: '#FFFFFF',
                          fontFamily: theme.fonts.body,
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      className="leading-snug"
                      style={{
                        color: theme.colors.font,
                        fontFamily: theme.fonts.heading,
                        fontSize: '1rem',
                      }}
                    >
                      {item.title}
                    </h4>

                    {/* Description */}
                    <p
                      className="text-xs leading-relaxed opacity-85 flex-1"
                      style={{ color: theme.colors.font, fontFamily: theme.fonts.body }}
                    >
                      {item.description}
                    </p>

                    {/* Date */}
                    <p
                      className="text-xs opacity-50 mt-auto"
                      style={{ color: theme.colors.font }}
                    >
                      {item.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {newsItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(i); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: selectedIndex === i ? '20px' : '6px',
                    height: '6px',
                    backgroundColor:
                      selectedIndex === i ? theme.colors.theme : `${theme.colors.theme}50`,
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
