/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出模式以优化 Docker 镜像大小
  // 这会创建一个最小化的生产构建，只包含必要的文件
  output: 'standalone',
  
  // 禁用遥测以提升隐私和性能
  telemetry: {
    disabled: true,
  },
  
  // 生产环境优化
  productionBrowserSourceMaps: false,
  
  // 压缩选项
  compress: true,
  
  // 图片优化配置
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
