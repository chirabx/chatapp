// ===== 图片压缩相关函数（用于消息发送） =====
import imageCompression from 'browser-image-compression';

// 将图片转换为小的模糊占位图（Base64）
export const generateBlurPlaceholder = async (imagePath, width = 40, height = 30) => {
    return new Promise((resolve) => {
        const img = new Image();

        // 对于本地资源，不需要设置 crossOrigin
        // 如果是跨域图片，可以设置 crossOrigin = 'anonymous'
        // img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // 绘制缩小的图片
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为Base64 (JPEG格式，质量50%)
                const base64 = canvas.toDataURL('image/jpeg', 0.5);
                resolve(base64);
            } catch (error) {
                console.warn('生成模糊占位图失败:', error);
                // 如果失败，返回一个简单的占位色块
                resolve(generateColorPlaceholder());
            }
        };

        img.onerror = () => {
            // 加载失败时返回颜色占位图
            resolve(generateColorPlaceholder());
        };

        img.src = imagePath;
    });
};

// 生成简单的颜色占位图
const generateColorPlaceholder = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 30;
    const ctx = canvas.getContext('2d');

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 40, 30);
    gradient.addColorStop(0, 'rgba(128, 128, 128, 0.3)');
    gradient.addColorStop(1, 'rgba(160, 160, 160, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 40, 30);

    return canvas.toDataURL('image/png');
};

// 预加载图片并返回Promise
// 注意：新代码请使用 preloadUtils.js 中的 preloadImage 以支持更好的错误处理
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * 压缩图片文件
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<string>} 压缩后的base64字符串
 */
export const compressImage = async (file, options = {}) => {
    const defaultOptions = {
        maxSizeMB: 2,          // (default: Number.POSITIVE_INFINITY)
        maxWidthOrHeight: 1920, // (default: undefined)
        useWebWorker: true,    // (default: true)
        maxIteration: 10,      // (default: 10)
        exifOrientationFn: null, // (default: undefined)
        fileType: 'image/webp', // (default: file.type)
        initialQuality: 0.8,   // (default: 1)
        alwaysKeepResolution: false // (default: false)
    };

    const compressionOptions = { ...defaultOptions, ...options };

    try {
        const compressedFile = await imageCompression(file, compressionOptions);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
        });
    } catch (error) {
        console.error("Error during image compression:", error);
        throw error;
    }
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
