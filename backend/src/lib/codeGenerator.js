import { generateResponse } from './deepseek.js';

// AI 概念代码模板
const CODE_TEMPLATES = {
    'linear_regression': {
        title: '线性回归示例',
        description: '使用 scikit-learn 实现简单的线性回归，预测房屋价格',
        code: `import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# 生成示例数据
np.random.seed(42)
X = 2 * np.random.rand(100, 1)  # 房屋面积
y = 4 + 3 * X + np.random.randn(100, 1)  # 房屋价格

# 创建并训练模型
model = LinearRegression()
model.fit(X, y)

# 预测
X_test = np.array([[0], [2]])
y_pred = model.predict(X_test)

# 可视化
plt.scatter(X, y, color='blue', label='实际数据')
plt.plot(X_test, y_pred, color='red', label='预测线')
plt.xlabel('房屋面积')
plt.ylabel('房屋价格')
plt.title('线性回归示例')
plt.legend()
plt.show()

print(f'模型参数：')
print(f'斜率：{model.coef_[0][0]:.2f}')
print(f'截距：{model.intercept_[0]:.2f}')`
    },
    'image_classification': {
        title: '图像分类示例',
        description: '使用 TensorFlow 实现简单的图像分类，识别手写数字',
        code: `import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt

# 加载 MNIST 数据集
(train_images, train_labels), (test_images, test_labels) = tf.keras.datasets.mnist.load_data()

# 数据预处理
train_images = train_images.reshape((60000, 28, 28, 1)).astype('float32') / 255
test_images = test_images.reshape((10000, 28, 28, 1)).astype('float32') / 255

# 构建 CNN 模型
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

# 编译模型
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# 训练模型
history = model.fit(train_images, train_labels, epochs=5, 
                    validation_data=(test_images, test_labels))

# 评估模型
test_loss, test_acc = model.evaluate(test_images, test_labels)
print(f'\\n测试准确率：{test_acc:.4f}')

# 可视化训练过程
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='训练准确率')
plt.plot(history.history['val_accuracy'], label='验证准确率')
plt.title('模型准确率')
plt.xlabel('Epoch')
plt.ylabel('准确率')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='训练损失')
plt.plot(history.history['val_loss'], label='验证损失')
plt.title('模型损失')
plt.xlabel('Epoch')
plt.ylabel('损失')
plt.legend()
plt.show()`
    },
    'kmeans_clustering': {
        title: 'K-means 聚类示例',
        description: '使用 scikit-learn 实现 K-means 聚类，对数据进行分组',
        code: `import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# 生成示例数据
np.random.seed(42)
X = np.random.randn(300, 2)  # 生成 300 个二维数据点

# 创建并训练 K-means 模型
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X)

# 获取聚类结果
labels = kmeans.labels_
centers = kmeans.cluster_centers_

# 可视化
plt.figure(figsize=(10, 6))
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis')
plt.scatter(centers[:, 0], centers[:, 1], c='red', marker='x', s=200, linewidths=3, label='聚类中心')
plt.title('K-means 聚类结果')
plt.xlabel('特征 1')
plt.ylabel('特征 2')
plt.legend()
plt.show()

print(f'聚类中心坐标：\\n{centers}')
print(f'\\n每个聚类的样本数：')
for i in range(3):
    print(f'聚类 {i}: {np.sum(labels == i)} 个样本')`
    }
};

// 获取可用的 AI 概念列表
export const getAvailableConcepts = () => {
    return Object.keys(CODE_TEMPLATES).map(key => ({
        id: key,
        title: CODE_TEMPLATES[key].title,
        description: CODE_TEMPLATES[key].description
    }));
};

// 生成代码示例
export const generateCodeExample = async (conceptId, customPrompt = '') => {
    try {
        // 检查概念是否存在
        if (!CODE_TEMPLATES[conceptId]) {
            throw new Error('不支持的 AI 概念');
        }

        const template = CODE_TEMPLATES[conceptId];

        // 构建提示词
        const prompt = customPrompt
            ? `请根据以下要求修改 ${template.title} 的代码：\n${customPrompt}\n\n原始代码：\n${template.code}`
            : `请为 ${template.title} 生成一个更详细的代码示例，包含完整的注释和说明。要求：
1. 保持代码的基本结构不变
2. 添加详细的中文注释
3. 解释每个关键步骤的作用
4. 说明如何运行代码和查看结果
5. 提供一些可能的改进建议

原始代码：\n${template.code}`;

        // 使用 AI 生成优化后的代码
        const enhancedCode = await generateResponse(prompt);

        return {
            success: true,
            concept: {
                id: conceptId,
                title: template.title,
                description: template.description,
                originalCode: template.code,
                enhancedCode: enhancedCode
            }
        };
    } catch (error) {
        console.error('生成代码示例失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}; 