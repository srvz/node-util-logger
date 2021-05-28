## 一个较为公共的log组件封装

继承自 `logger-intl`，由 `winston-logger` 驱动。

```bash
npm i @blued-core/winston-logger
```

### 使用方法

```typescript
import Logger from '../../src/index'

const logger = new Logger('logs', 'test')
logger.access({ msg: 'test' })
logger.error(new Error('test error'), { msg: 'test' })
```

### constructor

Argument|Type|Required|Desc
:--|:--|:--|:--
`logPath`|`string`|✅|日志输出的路径
`logType`|`string`|✅|日志的标识符`YYYY-MM-DD-%logType%.<access|error>.log`
`isLocal`|`string`|❌|是否为本地环境，开启 terminal 输出，默认为`false`

### environment variables

Argument|Type|Required|Desc
:--|:--|:--|:--
`LOG_META_SERVICE`|`string`|❌|在日志 meta 里添加 service 字段，默认不添加
`LOG_CONSOLE`|`string`|❌|是否开启输出日志到 console，默认关闭。值为 `true` 时开启
`LOG_FILE`|`string`|❌|是否关闭输出日志到文件，默认开启。值为 `false` 时关闭输出到文件，LOG_FILE 前缀变量均失效
`LOG_FILE_DIRNAME`|`string`|❌|日志输出的文件夹路径，必须为绝对路径，会覆盖 `logPath` 的设置
`LOG_FILE_ACCESS_FILENAME`|`string`|❌|访问日志的文件名标识符，默认为 `%DATE%-${logType}.access.log`
`LOG_FILE_ERROR_FILENAME`|`string`|❌|错误日志的文件名标识符，默认为 `%DATE%-${logType}.error.log`
`LOG_FILE_DATE_PATTERN`|`string`|❌|日志文件的日期前缀格式，默认为 `YYYY-MM-DD`
`LOG_FILE_MAX_FILES`|`string`|❌|日志最长保存时间，默认 `30d` 30 天
`LOG_FILE_MAX_SIZE`|`string`|❌|日志文件的最大尺寸，默认为 `null`，不限制，可选择为 `1g` `100m`

### access

Argument|Type|Required|Desc
:--|:--|:--|:--
`data`|`Record<string, any>`|❌|日志的输出内容

### error

Argument|Type|Required|Desc
:--|:--|:--|:--
`error`|`Error`|✅|日志的输出内容
`data`|`Record<string, any>`|❌|日志的输出内容

