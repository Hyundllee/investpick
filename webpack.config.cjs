const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

/**
 * KODEX 오늘의 투자픽 - webpack 설정
 * - entry: src/main.tsx
 * - src/assets 는 빌드 결과의 /assets 로 복사된다. (ReactSVG 가 /assets/... 경로를 직접 참조)
 * - /api 요청은 devServer proxy 로 실제 API 서버에 전달한다. (API_PROXY_TARGET 환경변수로 변경 가능)
 */
module.exports = (_env, argv) => {
  const isDev = argv.mode !== 'production'

  return {
    entry: path.resolve(__dirname, 'src/main.tsx'),

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
      publicPath: '/',
      clean: true,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    devtool: isDev ? 'eval-cheap-module-source-map' : false,

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              // tsconfig 는 noEmit: true(타입 검사 전용) 이므로 번들 시에만 emit 을 허용한다.
              compilerOptions: { noEmit: false },
            },
          },
        },
        {
          test: /\.scss$/i,
          use: [
            'style-loader',
            { loader: 'css-loader', options: { importLoaders: 2 } },
            {
              loader: 'sass-loader',
              options: {
                api: 'modern-compiler',
                sassOptions: {
                  quietDeps: true,
                  // 기존 프로젝트 방식(@import "../../utility/function.scss")을 유지하기 위해
                  // @import 지원 종료 경고만 숨긴다.
                  silenceDeprecations: ['import', 'global-builtin'],
                },
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|webp|svg)$/i,
          type: 'asset/resource',
          generator: { filename: 'static/[name].[hash:8][ext]' },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: { filename: 'static/fonts/[name][ext]' },
        },
      ],
    },

    plugins: [
      // 개발 모드에서만 투자픽 목 데이터를 사용하기 위한 플래그
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(isDev),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: path.resolve(__dirname, 'src/assets'), to: 'assets' }],
      }),
    ],

    performance: { hints: false },

    devServer: {
      port: 3001,
      hot: true,
      open: false,
      historyApiFallback: true,
      client: { overlay: { errors: true, warnings: false } },
      proxy: [
        {
          context: ['/api'],
          target: process.env.API_PROXY_TARGET || 'https://www.samsungfund.com',
          changeOrigin: true,
          secure: false,
        },
      ],
    },
  }
}
