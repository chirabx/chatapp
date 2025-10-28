import { useState, useRef, useEffect } from 'react';
import { Smile, X } from 'lucide-react';
import { EMOJI_CATEGORIES as DEFAULT_EMOJI_CATEGORIES } from '../constants/emoji';

const EmojiPickerButton = ({ onEmojiSelect, className = '', categories }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const emojiRef = useRef(null);
    const EMOJI_CATEGORIES = categories && categories.length > 0 ? categories : DEFAULT_EMOJI_CATEGORIES;

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleEmojiClick = (emoji) => {
        onEmojiSelect(emoji);
    };

    return (
        <div ref={emojiRef} className="relative">
            <button
                type="button"
                className={`btn btn-circle ${isOpen ? 'btn-active' : ''} ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                title="表情"
            >
                <Smile size={20} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                    <div className="relative bg-base-100 rounded-lg shadow-lg border border-base-300 w-[300px] h-[400px]">
                        {/* 分类标签 */}
                        <div className="flex border-b border-base-300 bg-base-200 rounded-t-lg overflow-x-auto scrollbar-hide">
                            {EMOJI_CATEGORIES.map((category, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`px-3 py-2 text-sm whitespace-nowrap transition-colors ${activeCategory === index
                                        ? 'bg-base-100 border-b-2 border-primary'
                                        : 'hover:bg-base-300'
                                        }`}
                                    onClick={() => setActiveCategory(index)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Emoji列表 */}
                        <div className="p-3 h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
                            <div className="grid grid-cols-8 gap-1">
                                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="w-9 h-9 flex items-center justify-center text-2xl leading-none rounded-md hover:bg-base-200 transition-colors select-none"
                                        onClick={() => handleEmojiClick(emoji.char || emoji)}
                                        title={(emoji.label || emoji).toString()}
                                    >
                                        {emoji.char || emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 关闭按钮 */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-base-200 transition-colors z-10"
                            title="关闭"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiPickerButton;

