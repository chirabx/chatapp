const MeteorShower = () => {
    // 生成流星的配置（数量、速度、延迟等）
    const meteorCount = 20;
    const meteors = Array.from({ length: meteorCount }, (_, i) => ({
        id: i,
        left: `${(i / (meteorCount - 1)) * 100}%`, // 均匀分布：从0%到100%
        delay: `${(i / meteorCount) * 3}s`, // 均匀延迟分布
        duration: `${3 + Math.random() * 2}s`, // 持续时间 3-5秒
        size: `${3 + Math.random() * 4}px`, // 流星大小 3-7px
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {meteors.map((meteor) => {
                const sizeNum = parseFloat(meteor.size);
                const tailWidth = sizeNum * 1.2; // 增加拖尾宽度
                const tailHeight = 300 + Math.random() * 100; // 长拖尾 300-400px
                // 确保流星完全在屏幕下方之外开始（拖尾最长约400px，加上安全边距）
                const startOffset = 450;

                return (
                    <div
                        key={meteor.id}
                        className="absolute"
                        style={{
                            left: meteor.left,
                            bottom: `-${startOffset}px`,
                            animation: `meteor-rise ${meteor.duration} linear ${meteor.delay} infinite`,
                        }}
                    >
                        <div
                            className="relative"
                            style={{
                                width: meteor.size,
                                height: meteor.size,
                            }}
                        >
                            {/* 流星核心 - 最亮的中心点 */}
                            <div
                                className="absolute rounded-full bg-white"
                                style={{
                                    width: sizeNum * 0.6 + 'px',
                                    height: sizeNum * 0.6 + 'px',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    boxShadow: `0 0 ${sizeNum * 2}px white, 0 0 ${sizeNum * 4}px hsl(var(--p)), 0 0 ${sizeNum * 6}px hsl(var(--p) / 0.6)`,
                                    zIndex: 3,
                                }}
                            />

                            {/* 流星主体 - 带强烈光晕效果 */}
                            <div
                                className="absolute rounded-full bg-primary"
                                style={{
                                    width: meteor.size,
                                    height: meteor.size,
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    opacity: 0.95,
                                    boxShadow: `0 0 ${sizeNum * 3}px hsl(var(--p)), 0 0 ${sizeNum * 6}px hsl(var(--p) / 0.8), 0 0 ${sizeNum * 10}px hsl(var(--p) / 0.5)`,
                                    zIndex: 2,
                                }}
                            />

                            {/* 主拖尾 - 超长且明显的渐变 */}
                            <div
                                className="absolute rounded-full"
                                style={{
                                    width: tailWidth + 'px',
                                    height: tailHeight + 'px',
                                    left: '50%',
                                    top: `-${tailHeight}px`,
                                    transform: 'translateX(-50%)',
                                    background: `linear-gradient(to top, 
                                        hsl(var(--p) / 1) 0%, 
                                        hsl(var(--p) / 0.95) 5%, 
                                        hsl(var(--p) / 0.9) 10%, 
                                        hsl(var(--p) / 0.8) 20%, 
                                        hsl(var(--p) / 0.6) 40%, 
                                        hsl(var(--p) / 0.4) 60%, 
                                        hsl(var(--p) / 0.25) 75%, 
                                        hsl(var(--p) / 0.15) 85%, 
                                        hsl(var(--p) / 0.08) 92%, 
                                        transparent 100%)`,
                                    filter: 'blur(1.5px)',
                                    zIndex: 1,
                                }}
                            />

                            {/* 外发光拖尾 - 增强视觉效果，更长 */}
                            <div
                                className="absolute rounded-full"
                                style={{
                                    width: (tailWidth * 2) + 'px',
                                    height: (tailHeight * 1.1) + 'px',
                                    left: '50%',
                                    top: `-${tailHeight * 1.1}px`,
                                    transform: 'translateX(-50%)',
                                    background: `linear-gradient(to top, 
                                        hsl(var(--p) / 0.5) 0%, 
                                        hsl(var(--p) / 0.35) 20%, 
                                        hsl(var(--p) / 0.2) 45%, 
                                        hsl(var(--p) / 0.1) 70%, 
                                        transparent 100%)`,
                                    filter: 'blur(3px)',
                                    zIndex: 0,
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            <style>{`
                @keyframes meteor-rise {
                    0% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    2% {
                        opacity: 0;
                    }
                    3% {
                        opacity: 1;
                    }
                    97% {
                        opacity: 1;
                    }
                    98% {
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(calc(-100vh - 450px)) translateX(30px);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default MeteorShower;
