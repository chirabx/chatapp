// 图片预加载工具函数

/**
 * 预加载单个图片
 * @param {string} src - 图片路径
 * @returns {Promise<HTMLImageElement>} 返回加载成功的图片对象
 */
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        if (!src) {
            reject(new Error('No source provided'));
            return;
        }

        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => {
            // 失败时也resolve，但可以传递错误信息（可选）
            resolve(img);
        };
        img.src = src;
    });
};

/**
 * 批量预加载图片（控制并发数量）
 * @param {string[]} srcs - 图片路径数组
 * @param {number} concurrency - 并发数量，默认3
 * @returns {Promise<void>}
 */
export const preloadImages = async (srcs, concurrency = 3) => {
    if (!srcs || srcs.length === 0) return;

    const validSrcs = srcs.filter(src => src);
    if (validSrcs.length === 0) return;

    // 分批加载，控制并发
    for (let i = 0; i < validSrcs.length; i += concurrency) {
        const batch = validSrcs.slice(i, i + concurrency);
        await Promise.all(batch.map(src => preloadImage(src)));
    }
};

/**
 * 使用 link rel="preload" 预加载关键图片
 * @param {string} src - 图片路径
 * @param {string} as - 资源类型，默认为 'image'
 */
export const addPreloadLink = (src, as = 'image') => {
    if (!src) return;

    // 检查是否已经存在相同的 preload link
    const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
};

/**
 * 移除 preload link
 * @param {string} src - 图片路径
 */
export const removePreloadLink = (src) => {
    if (!src) return;
    const link = document.querySelector(`link[rel="preload"][href="${src}"]`);
    if (link) {
        link.remove();
    }
};

