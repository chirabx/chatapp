// 预设背景图片配置
// 性能优化：所有图片都在 public 目录，由静态服务器直接提供

export const BACKGROUND_CATEGORIES = [
    {
        id: 'blueSkies',
        name: '蓝天白云',
        images: [
            { id: 'blueSkies_1', path: '/blueSkies/blue_skies_v01.png' },
            { id: 'blueSkies_2', path: '/blueSkies/blue_skies_v02.png' },
            { id: 'blueSkies_3', path: '/blueSkies/blue_skies_v03.png' },
        ]
    },
    {
        id: 'sceneries',
        name: '自然风景',
        images: [
            { id: 'sceneries_1', path: '/sceneries/_____1_VI_2560_1600.jpg' },
            { id: 'sceneries_2', path: '/sceneries/_____15_VI_2560_1600.jpg' },
            { id: 'sceneries_3', path: '/sceneries/_____19_VI_2560_1600.jpg' },
            { id: 'sceneries_4', path: '/sceneries/_____3_VI_2560_1600.jpg' },
            { id: 'sceneries_5', path: '/sceneries/_____4_VI_2560_1600.jpg' },
            { id: 'sceneries_6', path: '/sceneries/_____7_VI_2560_1600.jpg' },
        ]
    },
    {
        id: 'spacePlanet',
        name: '太空星球',
        images: [
            { id: 'spacePlanet_1', path: '/spacePlanet/01.jpg' },
            { id: 'spacePlanet_2', path: '/spacePlanet/02.jpg' },
            { id: 'spacePlanet_3', path: '/spacePlanet/03.jpg' },
        ]
    },
    {
        id: 'streetscape',
        name: '城市街景',
        images: [
            { id: 'streetscape_1', path: '/streetscape/03.jpg' },
            { id: 'streetscape_2', path: '/streetscape/04.jpg' },
            { id: 'streetscape_3', path: '/streetscape/05.jpg' },
        ]
    }
];

// 获取所有背景图片的扁平数组
export const getAllBackgrounds = () => {
    return BACKGROUND_CATEGORIES.flatMap(category =>
        category.images.map(img => ({
            ...img,
            categoryId: category.id,
            categoryName: category.name
        }))
    );
};

// 根据ID查找背景图片
export const getBackgroundById = (id) => {
    if (!id) return null;
    const allBackgrounds = getAllBackgrounds();
    return allBackgrounds.find(bg => bg.id === id) || null;
};

