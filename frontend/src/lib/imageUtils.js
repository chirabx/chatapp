/**
 * 图片压缩工具函数
 */

/**
 * 压缩图片
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度，默认 1920
 * @param {number} options.maxHeight - 最大高度，默认 1920
 * @param {number} options.quality - 图片质量 (0.1-1.0)，默认 0.8
 * @param {number} options.maxSizeMB - 最大文件大小(MB)，默认 2
 * @returns {Promise<string>} base64编码的图片数据
 */
export const compressImage = async (file, options = {}) => {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        maxSizeMB = 2
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                try {
                    // 创建canvas
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 计算缩放比例
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    // 如果图片本来就不大，使用原始尺寸
                    if (img.width <= maxWidth && img.height <= maxHeight && file.size <= maxSizeMB * 1024 * 1024) {
                        resolve(e.target.result);
                        return;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // 绘制图片
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 压缩为base64
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('图片压缩失败'));
                                return;
                            }

                            const reader = new FileReader();
                            reader.onload = (e) => {
                                resolve(e.target.result);
                            };
                            reader.onerror = () => reject(new Error('图片读取失败'));
                            reader.readAsDataURL(blob);
                        },
                        file.type || 'image/jpeg',
                        quality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
};

/**
 * 检查文件大小是否合适
 * @param {File} file - 文件
 * @param {number} maxSizeMB - 最大文件大小(MB)
 * @returns {boolean}
 */
export const checkFileSize = (file, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

