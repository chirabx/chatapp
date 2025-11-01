import { useState, useEffect } from 'react';
import { generateBlurPlaceholder } from '../lib/imageUtils';
import { preloadImage } from '../lib/preloadUtils';

/**
 * 渐进式图片加载 Hook
 * @param {string} src - 图片源路径
 * @param {number} placeholderWidth - 占位图宽度，默认40px
 * @param {number} placeholderHeight - 占位图高度，默认30px
 * @returns {object} { src: 高清图片路径, placeholder: 模糊占位图, loaded: 是否加载完成 }
 */
export const useProgressiveImage = (src, placeholderWidth = 40, placeholderHeight = 30) => {
    const [placeholder, setPlaceholder] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!src) {
            setPlaceholder(null);
            setLoaded(false);
            return;
        }

        let isMounted = true;

        // 生成模糊占位图
        generateBlurPlaceholder(src, placeholderWidth, placeholderHeight)
            .then((blurData) => {
                if (isMounted) {
                    setPlaceholder(blurData);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setPlaceholder(null);
                }
            });

        // 预加载高清图片
        preloadImage(src)
            .then(() => {
                if (isMounted) {
                    setLoaded(true);
                }
            })
            .catch(() => {
                // preloadImage 已经处理了错误，这里只是标记为未加载
                if (isMounted) {
                    setLoaded(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [src, placeholderWidth, placeholderHeight]);

    return {
        src: loaded ? src : null,
        placeholder: placeholder || null,
        loaded
    };
};

