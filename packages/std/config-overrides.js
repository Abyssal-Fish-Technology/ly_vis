const {
    override,
    fixBabelImports,
    addLessLoader,
    addWebpackAlias,
    overrideDevServer,
    addDecoratorsLegacy,
    removeModuleScopePlugin,
    babelInclude,
} = require('customize-cra')

const path = require('path')

// 跨域配置
const devServerConfig = () => config => {
    return {
        ...config,
        proxy: {
            '/d/': {
                target: 'server',
                changeOrigin: true,
            },
        },
    }
}

module.exports = {
    webpack: override(
        removeModuleScopePlugin(),
        babelInclude([path.resolve('src'), path.resolve('../components')]),
        addDecoratorsLegacy(),
        addWebpackAlias({
            '@': path.resolve('src'),
        }),
        fixBabelImports('import', {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true,
        }),
        addLessLoader({
            lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                    '@font-size-base': '12px',
                    '@font-family': 'sans-serif',
                    '@text-color': '#212529',
                },
            },
        })
    ),
    devServer: overrideDevServer(devServerConfig()),
}
