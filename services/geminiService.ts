/**
 * MyShell 2025 年度回顾 - AI 内容生成服务
 *
 * 安全架构：通过 Cloud Function 代理调用 Gemini API
 * - API Key 存储在 Cloud Function 环境变量中
 * - 前端代码中不包含任何 API Key
 * - 所有 AI 请求通过后端代理转发
 */

// ⚠️ 重要：部署 Cloud Function 后，请替换为实际的函数 URL
// 格式：https://REGION-PROJECT_ID.cloudfunctions.net/generate-content
const CLOUD_FUNCTION_URL = process.env.CLOUD_FUNCTION_URL ||
  'https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content';

console.log('🔧 Cloud Function 配置:');
console.log('   URL:', CLOUD_FUNCTION_URL);

/**
 * 调用 Cloud Function 生成内容
 * @param type 内容类型：'thanks-letter'（感谢信）或 'avatar'（头像）
 * @param developerName 开发者名称
 * @param botCount Bot 数量
 * @param topCategory 主要类别
 */
async function callCloudFunction(
  type: 'thanks-letter' | 'avatar',
  developerName: string,
  botCount: number,
  topCategory: string
): Promise<string | null> {
  try {
    console.log(`📡 调用 Cloud Function: type=${type}, developer=${developerName}`);

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        developerName,
        botCount,
        topCategory
      })
    });

    console.log(`📡 Cloud Function 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      console.error(`❌ Cloud Function 调用失败 (${response.status}):`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Cloud Function 返回失败:', data.error);
      throw new Error(data.error || '生成失败');
    }

    console.log(`✅ Cloud Function 调用成功: ${type}`);
    return data.result;

  } catch (error) {
    console.error(`❌ 调用 Cloud Function 失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 生成个性化感谢信
 * @param name 开发者名称
 * @param botCount Bot 数量
 * @param topTag 主要标签
 * @returns 感谢信文本
 */
export const generateArchetypeSummary = async (
  name: string,
  botCount: number,
  topTag: string
): Promise<string> => {
  try {
    console.log('📝 生成感谢信:', { name, botCount, topTag });

    const result = await callCloudFunction(
      'thanks-letter',
      name,
      botCount,
      topTag
    );

    if (!result) {
      throw new Error('感谢信生成返回空值');
    }

    console.log('✅ 感谢信生成成功');
    return result;

  } catch (error) {
    console.error('❌ 感谢信生成失败，返回备用文案:', error);

    // 返回备用感谢信（不依赖 API）
    return `${name}，你在 2025 年点燃了 ${botCount} 个创意火种，在 ${topTag} 领域绘制了属于自己的智能版图。感谢你为 MyShell 社区带来的每一份创新与热情！`;
  }
};

/**
 * 生成开发者个性化头像
 * @param developerName 开发者名称
 * @param botCount Bot 数量
 * @param topCategory 主要创作类别
 * @returns Base64 编码的图片 URL，失败返回 null
 */
export const generateDeveloperAvatar = async (
  developerName: string,
  botCount: number,
  topCategory: string
): Promise<string | null> => {
  try {
    console.log('🎨 生成开发者头像:', { developerName, botCount, topCategory });

    const result = await callCloudFunction(
      'avatar',
      developerName,
      botCount,
      topCategory
    );

    if (!result) {
      console.warn('⚠️ 头像生成返回空值');
      return null;
    }

    console.log('✅ 头像生成成功');
    return result;

  } catch (error) {
    console.error('❌ 头像生成失败:', error);
    return null;
  }
};

/**
 * 别名：生成未来愿景图片（与 generateDeveloperAvatar 相同）
 */
export const generateFutureVision = generateDeveloperAvatar;

/**
 * 检查 Cloud Function 健康状态
 * @returns 是否可用
 */
export async function checkCloudFunctionHealth(): Promise<boolean> {
  try {
    console.log('🔍 检查 Cloud Function 健康状态...');

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'OPTIONS', // 预检请求
    });

    const isHealthy = response.ok || response.status === 204;
    console.log(`${isHealthy ? '✅' : '❌'} Cloud Function 状态: ${isHealthy ? '正常' : '异常'}`);

    return isHealthy;
  } catch (error) {
    console.error('❌ Cloud Function 健康检查失败:', error);
    return false;
  }
}
