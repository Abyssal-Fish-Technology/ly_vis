import ipAddress from 'ip-address'

const { Address4, Address6 } = ipAddress

/** ********************************************************************** IpHandler start ***********************************************************************

/**
 * 私有地址：
 * A类 10.0.0.0/8
 * B类 172.16.0.0/12
 * C类 192.168.0.0/16
 * D类 127.0.0.0/8
 */
const PRIVATE_NET = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '127.0.0.0/8',
].map(ip => new Address4(ip))

window.cache = {}
const { isCache = true } = window.appConfig

/**
 * 返回ip-address的实例
 * @param {String} ip
 */
export function Address(ip) {
    const IpAddress = getDeviceType(ip).ipType === 'v4' ? Address4 : Address6
    return new IpAddress(ip)
}

/**
 * ip是否在资产组中
 * @param {String} ip
 * @param {String} net
 * @return {Boolean}
 */
export function isInSubnet(ip, net) {
    const obj = window.cache[net]
    if (obj && obj[ip] !== undefined) {
        return obj[ip]
    }
    if (!obj) window.cache[net] = {}
    const { ipType: ipTtype } = getDeviceType(ip)
    const { ipType: netType } = getDeviceType(net)

    if (ipTtype && netType && ipTtype !== netType) {
        return false
    }

    const ipAddr = Address(ip)
    const netAddr = Address(net)
    const isBelong = ipAddr.isInSubnet(netAddr)
    if (isCache) {
        window.cache[net][ip] = isBelong
    }
    return isBelong
}

/**
 * 判断是否为私有地址（ipv6返回false）
 * @param {String} ip
 */
export function isPrivateIP(ip = '') {
    const { ipType = '' } = getDeviceType(ip)
    if (ipType && ipType === 'v6') return false
    const addr = new Address4(ip)
    return PRIVATE_NET.some(a => addr.isInSubnet(a))
}

/**
 * 从address对象中返回IP地址
 * @param {Address} addr
 */
export function getIpString(addr) {
    let { subnet } = addr
    subnet =
        (addr.v4 && subnet === '/32') || (!addr.v4 && subnet === '/128')
            ? ''
            : subnet
    const netAddr = addr.startAddress()
    return netAddr.correctForm() + subnet
}

/** ***********************************************************************  end ************************************************************************* */
/**
 *
 * 需要准确的判断出来设备的类型。
 * 例如 ipv4，ipv6, ip是否带有掩码，ip是否带有Port等。
 * 本函数支持四种格式的查找
 * - ip(包括复杂IP)
 * - port(纯Port)
 *!- 域名:注意这里.ip:port的形式也是name的一种
 * - URL
 * @param {String} device 设备名称，注意传入的数据不能太过于离谱。应该本身就差不多是IP、port或者Url的形态等。
 * @returns {
 *      ip: '',
 *      ipType: v4,
 *      port: 41,
 *      mask: 32,
 *      has*: true,
 *      isOnly*: true,
 * }
 * ! 进来的数据全部都会变成字符串，所有返回的时候不用担心 数字 0 的问题
 */
export function getDeviceType(device = '') {
    const useDevice = device.toString()
    const typeObj = {}
    const portEntryReg = /^([0-9]|[1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/

    /**
     * 如果匹配到了Port，这个就比较简单了，目前就是单纯的匹配到纯Port即可
     */
    const isPortMatch = useDevice.match(portEntryReg)
    if (isPortMatch) {
        typeObj.isOnlyPort = true
        typeObj.hasPort = true
        ;[typeObj.port] = isPortMatch
        return typeObj
    }

    const ipV4Reg = /((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)/
    const ipV6Reg = /(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))/
    const isMatchIpv4 = useDevice.match(ipV4Reg)
    const isMatchIpv6 = isMatchIpv4 ? null : useDevice.match(ipV6Reg)

    /**
     * 如果匹配到了IP，ip是最为复杂的形态。大致分为以下几类
     * - ip
     * - ip：port
     * - ip/mask
     * - domain：例如 1.1.1.1:80
     * - URL形态：例如 https: 1.1.1.1:80/test
     * 1.首先判断IP的类型，是V4还是v6
     * 2.然后看看除了IP是否还有其他的信息。目前还支持两种格式 [ip:port, ip/mask].还有域名和name带有IP的
     * */
    let throwIpStr = useDevice
    if (isMatchIpv4 || isMatchIpv6) {
        const useIpReg = isMatchIpv4 ? ipV4Reg : ipV6Reg
        typeObj.hasIp = true
        if (isMatchIpv4) {
            ;[typeObj.ip] = isMatchIpv4
            typeObj.ipType = 'v4'
        } else if (isMatchIpv6) {
            ;[typeObj.ip] = isMatchIpv6
            typeObj.ipType = 'v6'
        }
        // 除去IP之后的数据
        throwIpStr = useDevice.replace(useIpReg, '')
        if (throwIpStr === '') {
            typeObj.isOnlyIp = true
            typeObj.mask = isMatchIpv4 ? '32' : '128'
        } else {
            typeObj.isOnlyIp = false
            // 判断是不是还有端口, 必须紧紧跟随着IP才是Port
            const ipWithportReg = new RegExp(
                `(${useIpReg.toString().slice(1, -1)}):(\\d)+`
            )
            const ipWithMaskReg = new RegExp(
                `(${useIpReg.toString().slice(1, -1)})/(\\d)+`
            )
            const isMatchPort = useDevice.match(ipWithportReg)
            const ipWithMask = useDevice.match(ipWithMaskReg)
            // 如果匹配到了类似Ip:port的形式的话，判断Port是否合法
            if (isMatchPort) {
                const port = isMatchPort[0].split(':')[1]
                if (portEntryReg.test(port)) {
                    typeObj.hasPort = true
                    typeObj.port = port
                }
            }
            if (ipWithMask) {
                ;[, typeObj.mask] = ipWithMask[0].split('/')
            }
        }
    }

    /**
     * 测试是不是域名，这个比对是要要IP的给扔掉才行, 也就是使用throwIpStr这个字符串来匹配domain
     */
    const domainReg = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/
    const isDomainMatch = throwIpStr.match(domainReg)

    // 测试是不是URl, url必须带有传输协议
    // eslint-disable-next-line no-useless-escape
    const urlReg = /[a-zA-Z]+:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const isUrlMatch = useDevice.match(urlReg)

    if (isDomainMatch) {
        typeObj.hasDomain = true
        typeObj.isOnlyDomain =
            useDevice.replace(domainReg, '') === '' && !isUrlMatch
        ;[typeObj.domain] = isDomainMatch
    }

    if (isUrlMatch) {
        typeObj.hasUrl = true
        typeObj.isOnlyUrl = useDevice.replace(urlReg, '') === ''
        ;[typeObj.domain] = isUrlMatch
    }
    return typeObj
}
