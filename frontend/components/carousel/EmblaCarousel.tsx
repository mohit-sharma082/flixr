import React, { useCallback, useEffect, useRef } from 'react';
import { DotButton, useDotButton } from './EmblaCarouselDotButton';
import {
    PrevButton,
    NextButton,
    usePrevNextButtons,
} from './EmblaCarouselArrowButtons';
// @ts-ignore
import './embla.css';
import { Star } from 'lucide-react';

import useEmblaCarousel from 'embla-carousel-react';
import type {
    EmblaCarouselType,
    EmblaEventType,
    EmblaOptionsType,
} from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Movie, TVShow } from '@/lib/interfaces';
import Link from 'next/link';

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type Item = {
    id: number;
    mediaType: 'movie' | 'tv';
    title: string;
    overview?: string | null;
    backdrop?: string | null;
    poster?: string | null;
    releaseYear?: string | number | null;
    vote_average?: number;
    raw: Movie | TVShow;
};

type PropType = {
    slides: Item[];
    options?: CarouselOptions;
};

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
const TWEEN_FACTOR_BASE = 0.5;

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { slides, options } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);

    const tweenFactor = useRef(0);
    const tweenNodes = useRef<HTMLElement[]>([]);

    const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;

        const resetOrStop =
            autoplay.options.stopOnInteraction === false
                ? autoplay.reset
                : autoplay.stop;

        resetOrStop();
    }, []);

    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
        emblaApi,
        onNavButtonClick
    );

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi, onNavButtonClick);

    const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
        tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
            return slideNode.querySelector(
                '.embla__parallax__layer'
            ) as HTMLElement;
        });
    }, []);

    const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
        tweenFactor.current =
            TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
    }, []);

    const tweenParallax = useCallback(
        (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
            const engine = emblaApi.internalEngine();
            const scrollProgress = emblaApi.scrollProgress();
            const slidesInView = emblaApi.slidesInView();
            const isScrollEvent = eventName === 'scroll';

            emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
                let diffToTarget = scrollSnap - scrollProgress;
                const slidesInSnap = engine.slideRegistry[snapIndex];

                slidesInSnap.forEach((slideIndex) => {
                    if (isScrollEvent && !slidesInView.includes(slideIndex))
                        return;

                    if (engine.options.loop) {
                        engine.slideLooper.loopPoints.forEach((loopItem) => {
                            const target = loopItem.target();

                            if (slideIndex === loopItem.index && target !== 0) {
                                const sign = Math.sign(target);

                                if (sign === -1) {
                                    diffToTarget =
                                        scrollSnap - (1 + scrollProgress);
                                }
                                if (sign === 1) {
                                    diffToTarget =
                                        scrollSnap + (1 - scrollProgress);
                                }
                            }
                        });
                    }

                    const translate =
                        diffToTarget * (-1 * tweenFactor.current) * 100;
                    const tweenNode = tweenNodes.current[slideIndex];
                    tweenNode.style.transform = `translateX(${translate}%)`;
                });
            });
        },
        []
    );

    useEffect(() => {
        if (!emblaApi) return;

        setTweenNodes(emblaApi);
        setTweenFactor(emblaApi);
        tweenParallax(emblaApi);

        emblaApi
            .on('reInit', setTweenNodes)
            .on('reInit', setTweenFactor)
            .on('reInit', tweenParallax)
            .on('scroll', tweenParallax)
            .on('slideFocus', tweenParallax);
    }, [emblaApi, tweenParallax]);

    return (
        <section className='embla '>
            <div className='embla__viewport' ref={emblaRef}>
                <div className='embla__container'>
                    {slides?.map((item, index) => {
                        const backdrop = item.backdrop
                            ? `${IMAGE_BASE}${item.backdrop}`
                            : item.poster
                            ? `${IMAGE_BASE}${item.poster}`
                            : '/placeholder.svg';
                        const href =
                            item.mediaType === 'movie'
                                ? `/movie/${item.id}`
                                : `/tv/${item.id}`;
                        return (
                            <div className={`embla__slide `} key={index}>
                                <div className='embla__parallax  relative'>
                                    <Link href={href} key={index}>
                                        <div className='absolute inset-0 h-full w-full bg-gradient-to-tr from-black via-black/60 to-transparent z-20 p-2 md:p-6'>
                                            <div className='flex flex-col gap-2 items-start justify-end w-[70%] h-full'>
                                                <span className='scale-75 md:scale-100 bg-primary text-primary-foreground px-3 py-1 ring-1 ring-offset-2 rounded-full flex  items-center gap-1 text-xs font-bold'>
                                                    <Star
                                                        className='h-3 w-3 '
                                                        strokeWidth={3}
                                                    />
                                                    {item.vote_average?.toFixed(
                                                        1
                                                    )}
                                                </span>
                                                <span className='text-xs md:text-sm text-white/80 line-clamp-2 md:line-clamp-6'>
                                                    {item.overview}
                                                </span>
                                                <div className='flex gap-2'>
                                                    {item?.raw?.genres?.map(
                                                        (genre, i) => (
                                                            <span
                                                                key={i}
                                                                className='text-xs uppercase border border-border/20 bg-muted/20 font-semibold text-secondary-foreground px-3 py-1 rounded-full'>
                                                                {genre?.name}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <span className='text-base md:text-lg font-bold text-white'>
                                                    {item.title}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='embla__parallax__layer'>
                                            <img
                                                className='embla__slide__img embla__parallax__img'
                                                src={backdrop}
                                                alt={item.title ?? index + 1}
                                            />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className='embla__controls'>
                <div className='embla__buttons'>
                    <PrevButton
                        onClick={onPrevButtonClick}
                        disabled={prevBtnDisabled}
                    />
                    <NextButton
                        onClick={onNextButtonClick}
                        disabled={nextBtnDisabled}
                    />
                </div>

                <div className='embla__dots '>
                    {scrollSnaps.map((_, index) => (
                        <DotButton
                            key={index}
                            onClick={() => onDotButtonClick(index)}
                            className={'embla__dot'.concat(
                                index === selectedIndex
                                    ? ' embla__dot--selected'
                                    : ''
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EmblaCarousel;
