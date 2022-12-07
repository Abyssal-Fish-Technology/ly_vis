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
                target:
                    process.env.REACT_APP_ENV === 'dev'
                        ? 'http://101.254.236.76:11380/'
                        : 'http://10.10.1.66:3000/mock/24/',
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
