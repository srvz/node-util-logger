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
`isLocal`|`boolean`|❌|是否为本地环境，开启控制台输出，默认为`false`

### access

Argument|Type|Required|Desc
:--|:--|:--|:--
`data`|`Record<string, any>`|❌|日志的输出内容

### error

Argument|Type|Required|Desc
:--|:--|:--|:--
`error`|`Error`|✅|日志的输出内容
`data`|`Record<string, any>`|❌|日志的输出内容

