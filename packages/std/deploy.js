/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const path = require('path')
const util = require('util')
const events = require('events')
const { Client } = require('ssh2')
const fs = require('fs')
const inquirer = require('inquirer')

// 链接远程服务器
function doConnect(serverObj, then) {
    const conn = new Client()
    conn.on('ready', () => {
        if (then) {
            then(conn)
        }
    })
        .on('error', err => {
            console.error('connect error!', err)
        })
        .on('close', () => {
            conn.end()
        })
        .connect(serverObj)
}

function doShell(serverObj, cmd, then) {
    doConnect(serverObj, conn => {
        conn.shell((err, stream) => {
            if (err) throw err
            else {
                let buf = ''
                stream
                    .on('close', () => {
                        conn.end()
                        if (then) {
                            then(err, buf)
                        }
                    })
                    .on('data', data => {
                        buf += data
                    })
                    .stderr.on('data', data => {
                        console.log(`stderr: ${data}`)
                    })
                stream.end(cmd)
            }
        })
    })
}

function doGetFileAndDirList(localDir, dirs, files) {
    const dir = fs.readdirSync(localDir)
    for (let i = 0; i < dir.length; i += 1) {
        const p = path.join(localDir, dir[i])
        const stat = fs.statSync(p)
        if (stat.isDirectory()) {
            dirs.push(p)
            doGetFileAndDirList(p, dirs, files)
        } else {
            files.push(p)
        }
    }
}

function Control() {
    events.EventEmitter.call(this)
}

util.inherits(Control, events.EventEmitter)

const control = new Control()

control.on('doNext', (todos, then) => {
    if (todos.length > 0) {
        const func = todos.shift()
        func(err => {
            if (err) {
                then(err)
                throw err
            } else {
                control.emit('doNext', todos, then)
            }
        })
    } else {
        then(null)
    }
})

function doUploadFile(serverObj, localPath, remotePath, then) {
    doConnect(serverObj, conn => {
        conn.sftp((err, sftp) => {
            if (err) {
                then(err)
            } else {
                sftp.fastPut(
                    localPath,
                    remotePath,
                    {
                        chunkSize: 10485760,
                    },
                    (err1, result) => {
                        conn.end()
                        then(err1, result)
                    }
                )
            }
        })
    })
}

function doUploadDir(serverObj, localDir, remoteDir, then) {
    const dirs = []
    const files = []
    doGetFileAndDirList(localDir, dirs, files)

    // 创建远程目录
    const todoDir = []
    console.log(dirs)
    dirs.forEach(dir => {
        todoDir.push(done => {
            const to = path
                .join(remoteDir, dir.slice(localDir.length + 1))
                .replace(/[\\]/g, '/')
            const cmd = `mkdir -p ${to}\r\nexit\r\n`
            console.log(`cmd:: ${cmd}`)
            doShell(serverObj, cmd, done)
        }) // end of push
    })

    // 上传文件
    const todoFile = []
    files.forEach(file => {
        todoFile.push(done => {
            const to = path
                .join(remoteDir, file.slice(localDir.length + 1))
                .replace(/[\\]/g, '/')
            console.log(`upload ${to}`)
            doUploadFile(serverObj, file, to, done)
        })
    })
    control.emit('doNext', todoDir, err => {
        if (err) {
            console.log(err)
            throw err
        } else {
            control.emit('doNext', todoFile, then)
        }
    })
}

const askQuestions = () => {
    const questions = [
        {
            type: 'input',
            name: 'host',
            message: '请输入服务器地址',
            validate: str => Boolean(str.length),
        },
        {
            type: 'input',
            name: 'port',
            message: '请输入服务器端口',
            validate: str => Boolean(str.length),
        },
        {
            type: 'input',
            name: 'username',
            default: 'root',
            message: '请输入用户名',
            validate: str => Boolean(str.length),
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入密码',
            validate: str => Boolean(str.length),
        },
        {
            type: 'input',
            name: 'basepath',
            default: '/var/www/html',
            message: '请输入部署路径',
            validate: str => Boolean(str.length),
        },
        {
            type: 'input',
            name: 'basename',
            message: '请输入项目文件夹',
            validate: str => Boolean(str.length),
        },
    ]
    return inquirer.prompt(questions)
}

const run = async () => {
    const answers = await askQuestions()
    const { host, port, username, password, basepath, basename } = answers
    const bakDirName = `${basename}.bak${new Date().toLocaleString()}` // 备份文件名
    const buildPath = path.resolve('./build') // 本地项目编译后的文件目录
    const server = {
        host,
        port,
        username,
        password,
    }

    console.log('--------deploy config--------------')
    console.log(`服务器host:            ${host}:${port}`)
    console.log(`项目文件夹:            ${basepath}/${basename}`)
    console.log(`项目部署以及备份目录:  ${basepath}`)
    console.log(`备份后的文件夹名:      ${bakDirName}`)
    console.log('--------deploy start--------------')

    // 连接服务器，迁移老项目
    doShell(
        server,
        `mv ${basepath}/${basename} ${basepath}/${bakDirName}\nexit\n`
    )
    // 创建新项目，上传文件
    doUploadDir(server, buildPath, `${basepath}/${basename}`, () =>
        console.log('--------deploy end--------------')
    )
}

run()
