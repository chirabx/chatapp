import { useState } from 'react';
import { X } from 'lucide-react';

const ImagePreview = ({ src, alt = '图片预览', className = '' }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleImageClick = () => {
        setIsPreviewOpen(true);
    };

    const handleClosePreview = (e) => {
        if (e.target === e.currentTarget) {
            setIsPreviewOpen(false);
        }
    };

    return (
        <>
            {/* 缩略图 */}
            <img
                src={src}
                alt={alt}
                className={`cursor-pointer hover:opacity-90 transition-opacity ${className}`}
                onClick={handleImageClick}
            />

            {/* 预览弹窗 */}
            {isPreviewOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={handleClosePreview}
                >
                    {/* 关闭按钮 */}
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        onClick={() => setIsPreviewOpen(false)}
                    >
                        <X size={24} />
                    </button>

                    {/* 图片容器 */}
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ImagePreview; 