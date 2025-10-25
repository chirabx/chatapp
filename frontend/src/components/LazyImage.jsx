import { useState, useRef, useEffect } from 'react';

const LazyImage = ({
    src,
    alt,
    className = "",
    fallback = "/avatar.png",
    placeholder = "/avatar.png",
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadImage();
                        observer.unobserve(img);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(img);

        return () => {
            if (img) {
                observer.unobserve(img);
            }
        };
    }, [src]);

    const loadImage = () => {
        if (!src) {
            setImageSrc(fallback);
            setIsLoading(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            setHasError(false);
        };
        img.onerror = () => {
            setImageSrc(fallback);
            setIsLoading(false);
            setHasError(true);
        };
        img.src = src;
    };

    return (
        <div className={`relative ${className}`} {...props}>
            <img
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
                onError={() => {
                    setImageSrc(fallback);
                    setHasError(true);
                    setIsLoading(false);
                }}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-200 rounded-full">
                    <div className="loading loading-spinner loading-sm"></div>
                </div>
            )}
        </div>
    );
};

export default LazyImage;
